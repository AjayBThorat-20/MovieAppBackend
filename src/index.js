const express = require("express");
const dontenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const movieRoutes = require("./routes/movieRoutes");
const cors = require('cors');
const cron = require('node-cron');
const { fetchAndStoreMovies } = require('./scripts/fetchMovies');

dbConnect();
 
const app = express();

// Add this before your routes
app.use(cors({
  origin: process.env.FRONTEND_URL, // Your frontend URL
  credentials: true
}));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});


cron.schedule('52 23 * * *', async () => {
  console.log('Running the fetchAndStoreMovies task...');
  try {
    await fetchAndStoreMovies();
    console.log('Movie fetch task completed successfully');
  } catch (error) {
    console.error('Movie fetch task failed:', error);
  } finally {
    // End the Node.js process after the task is done
    // process.exit();
  }
});


// middleware
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
// start the server
const PORT = process.env.PORT || 7002;
app.listen(PORT,()=>{
console.log(`server is running at port ${PORT}`)
});
