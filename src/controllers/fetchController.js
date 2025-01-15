const puppeteer = require('puppeteer');
const Movie = require('../models/movieModel');
const User = require('../models/userModel');

async function fetchAndStoreMovies() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Access IMDb directly
    await page.goto(`${process.env.IMDB_URL}`, {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });

    // Scrape the movie data
    const movies = await page.evaluate(() => {
      const movieList = [];
      const movieElements = document.querySelectorAll('.ipc-metadata-list li');

      movieElements.forEach(movie => {
        const title = movie.querySelector('.ipc-title__text')?.textContent.trim();
        const description = movie.querySelector('.ipc-title-link-wrapper')?.textContent.trim();
        const rating = movie.querySelector('.ipc-rating-star--rating')?.textContent.trim();

        // Extract releaseDate and duration from the first two spans
        const metadataItems = movie.querySelectorAll('.cli-title-metadata-item');
        const releaseDate = metadataItems[0]?.textContent.trim(); // First <span>
        const duration = metadataItems[1]?.textContent.trim(); // Second <span>

        if (title && description && rating && releaseDate && duration) {
          // Remove everything before the first space
          const cleanTitle = title.replace(/^[^\s]+\s*/, '').trim();
          const cleanDescription = description.replace(/^[^\s]+\s*/, '').trim();

          movieList.push({
            name: cleanTitle,
            description: cleanDescription,
            rating: rating,
            releaseDate: releaseDate,
            duration: duration,
          });
        }
      });

      return movieList;
    });

    // Store movies in the database
    for (const movie of movies) {
      const createdBy = await User.findOne({ role: 'admin' });
      if (createdBy) {
        // Check if movie already exists based on title
        const existingMovie = await Movie.findOne({ name: movie.name });

        // Only add if the movie doesn't already exist
        if (!existingMovie) {
          const newMovie = new Movie({
            ...movie,
            createdBy: createdBy._id,
          });

          try {
            await newMovie.save();
            console.log(`Movie '${movie.name}' saved to database.`);
          } catch (err) {
            console.error('Error saving movie to database:', err.message);
          }
        } else {
          console.log(`Movie '${movie.name}' already exists in the database. Skipping.`);
        }
      }
    }

    console.log('Movies have been fetched and stored successfully');
  } catch (error) {
    console.error('Error fetching or storing movies:', error.message);
  } finally {
    await browser.close();
  }
}

module.exports = { fetchAndStoreMovies };
