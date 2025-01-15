const Movie = require("../models/movieModel");
const Fuse = require('fuse.js');

// Helper function to convert duration string to minutes
const convertDurationToMinutes = (durationStr) => {
    const hours = durationStr.match(/(\d+)h/);
    const minutes = durationStr.match(/(\d+)m/);
    return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
};

// // Controller function to handle searching, sorting, and pagination
// const getMovies = async (req, res) => {
//     try {
//         const { query, sortBy, page = 1, limit = 8 } = req.query;
//         const skip = (page - 1) * limit;
//         let movies;
//         let total;

//         // Base query
//         let mongoQuery = {};
//         let sortQuery = { releaseDate: -1 }; // Default sort

//         // Handle sorting
//         if (sortBy) {
//             const [field, order] = sortBy.split('-');
//             const direction = order === 'desc' ? -1 : 1;
            
//             switch (field) {
//                 case 'name':
//                 case 'rating':
//                 case 'releaseDate':
//                     sortQuery = { [field]: direction };
//                     break;
//                 case 'duration':
//                     // For duration, we'll need to handle it post-query
//                     sortQuery = {};
//                     break;
//             }
//         }

//         if (query) {
//             // Fetch all movies for fuzzy search
//             const allMovies = await Movie.find(mongoQuery)
//                 .lean()
//                 .exec();

//             // Configure Fuse.js for fuzzy searching
//             const fuseOptions = {
//                 keys: ['name', 'description'],
//                 threshold: 0.3,
//                 includeScore: true
//             };
//             const fuse = new Fuse(allMovies, fuseOptions);
//             const searchResults = fuse.search(query);
//             let filteredMovies = searchResults.map(result => result.item);

//             // Handle duration sorting separately
//             if (sortBy && sortBy.startsWith('duration')) {
//                 const direction = sortBy.endsWith('desc') ? -1 : 1;
//                 filteredMovies.sort((a, b) => {
//                     const durationA = convertDurationToMinutes(a.duration);
//                     const durationB = convertDurationToMinutes(b.duration);
//                     return (durationA - durationB) * direction;
//                 });
//             }

//             total = filteredMovies.length;
//             movies = filteredMovies.slice(skip, skip + parseInt(limit));
//         } else {
//             // No search query
//             if (sortBy && sortBy.startsWith('duration')) {
//                 // For duration sorting, fetch all and sort in memory
//                 const allMovies = await Movie.find(mongoQuery).lean();
//                 const direction = sortBy.endsWith('desc') ? -1 : 1;
                
//                 allMovies.sort((a, b) => {
//                     const durationA = convertDurationToMinutes(a.duration);
//                     const durationB = convertDurationToMinutes(b.duration);
//                     return (durationA - durationB) * direction;
//                 });

//                 total = allMovies.length;
//                 movies = allMovies.slice(skip, skip + parseInt(limit));
//             } else {
//                 // For other sorts, use MongoDB sorting
//                 movies = await Movie.find(mongoQuery)
//                     .sort(sortQuery)
//                     .skip(skip)
//                     .limit(parseInt(limit))
//                     .lean()
//                     .exec();

//                 total = await Movie.countDocuments(mongoQuery);
//             }
//         }

//         res.json({
//             movies,
//             currentPage: parseInt(page),
//             totalPages: Math.ceil(total / limit),
//             totalMovies: total
//         });
//     } catch (err) {
//         res.status(500).json({ 
//             message: "Error fetching movies", 
//             error: err.message 
//         });
//     }
// };







// Controller function to handle searching, sorting, and pagination
const getMovies = async (req, res) => {
    try {
        const { query, sortBy, page = 1, limit = 8 } = req.query;
        const skip = (page - 1) * limit;
        let movies;
        let total;

        // Base query for MongoDB
        let mongoQuery = {};

        // Fetch all movies if search query exists
        let allMovies = await Movie.find(mongoQuery).lean().exec();

        if (query) {
            // Configure Fuse.js for fuzzy searching
            const fuseOptions = {
                keys: ["name", "description"],
                threshold: 0.1,
                includeScore: true,
            };
            const fuse = new Fuse(allMovies, fuseOptions);
            const searchResults = fuse.search(query);
            allMovies = searchResults.map((result) => result.item);
        }

        // Handle sorting
        if (sortBy) {
            const [field, order] = sortBy.split("-");
            const direction = order === "desc" ? -1 : 1;

            if (field === "duration") {
                // Sort by duration in memory
                allMovies.sort((a, b) => {
                    const durationA = convertDurationToMinutes(a.duration);
                    const durationB = convertDurationToMinutes(b.duration);
                    return (durationA - durationB) * direction;
                });
            } else {
                // Sort by other fields
                allMovies.sort((a, b) => {
                    if (a[field] > b[field]) return 1 * direction;
                    if (a[field] < b[field]) return -1 * direction;
                    return 0;
                });
            }
        }

        // Pagination
        total = allMovies.length;
        movies = allMovies.slice(skip, skip + parseInt(limit));

        res.json({
            movies,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalMovies: total,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching movies",
            error: err.message,
        });
    }
};

const addMovie = async (req, res) => {
    try {
        const { name, description, rating, releaseDate, duration } = req.body;

        // Validate duration format (should be in "Xh Ym" format)
        if (!duration.match(/^\d+h \d+m$/)) {
            return res.status(400).json({ 
                message: "Invalid duration format. Use format: '1h 42m'" 
            });
        }

        const movie = new Movie({
            name,
            description,
            rating,
            releaseDate,
            duration,
            createdBy: req.user.id
        });

        const savedMovie = await movie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        res.status(500).json({ message: "Error adding movie", error: err.message });
    }
};

const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate duration format if it's being updated
        if (updates.duration && !updates.duration.match(/^\d+h \d+m$/)) {
            return res.status(400).json({ 
                message: "Invalid duration format. Use format: '1h 42m'" 
            });
        }

        const movie = await Movie.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: "Error updating movie", error: err.message });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const movie = await Movie.findByIdAndDelete(id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.json({ message: "Movie deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting movie", error: err.message });
    }
};

module.exports = {
    getMovies,
    addMovie,
    updateMovie,
    deleteMovie
};