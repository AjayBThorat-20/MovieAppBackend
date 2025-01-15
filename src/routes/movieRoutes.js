const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
    getMovies,
    addMovie,
    updateMovie,
    deleteMovie
} = require("../controllers/movieController");
// Public routes
router.get("/", getMovies);

// Admin only routes
router.post("/", verifyToken, authorizeRoles("admin"), addMovie);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateMovie);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteMovie);

module.exports = router;