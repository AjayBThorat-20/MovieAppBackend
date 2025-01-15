const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    releaseDate: { type: Date, required: true },
    duration: { type: String, required: true }, // duration in minutes
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who added it
});

module.exports = mongoose.model("Movie", movieSchema);
