# Movie Management System

A robust system for managing movies, including user authentication, movie scraping from IMDb, and advanced search and sorting capabilities. This project is built using **Node.js**, **Express.js**, **MongoDB**, and **Puppeteer**.

## Features

- **User Authentication**:
  - Register new users with secure password hashing
  - Login functionality with JWT-based authentication

- **Movie Management**:
  - Scrape and store movie data from IMDb
  - Search movies using fuzzy search powered by Fuse.js
  - Sort movies by attributes like name, rating, release date, or duration
  - Paginate results for better data handling

- **Movie Scraping**:
  - Retrieve movie data directly from IMDb using Puppeteer
  - Ensure only unique movies are stored in the database

## Project Structure

```plaintext
├── config/
│   └── dbConnect.js          # MongoDB connection setup and error handling
├── middlewares/
│   ├── authMiddleware.js     # JWT verification middleware
│   └── roleMiddleware.js     # Role-based access control
├── models/
│   ├── userModel.js         # User schema definition
│   └── movieModel.js        # Movie schema definition
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── movieController.js   # Movie operations
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── userRoutes.js       # User endpoints
│   └── movieRoutes.js      # Movie endpoints
├── script/
│   ├── fetchMovies.js		# IMDb data scraping
├── index.js               # Main application file
└── .env     
              # Environment variables
```

## Comments Guide

The codebase includes comprehensive comments explaining:

1. **Configuration Files**:
   - Database connection parameters
   - Error handling strategies
   - Environment variable usage

2. **Controller Functions**:
   - Function purpose and parameters
   - Request/response flow
   - Error handling approach
   - Business logic explanation

3. **Middleware**:
   - Authentication process
   - Role verification
   - Request validation

4. **Models**:
   - Schema definitions
   - Field validations
   - Relationships between models

5. **Routes**:
   - Endpoint definitions
   - Required permissions
   - Request/response formats

## Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd movie-management-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create `.env` file with:
   ```
   PORT=7002
   JWT_SECRET=your_jwt_secret
   CONNECTION_STRING=mongodb://localhost:27017/your_db
   IMDB_URL=https://api.allorigins.win/raw?url=https://www.imdb.com/chart/top/?ref_=nv_mv_250
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   - Ensure MongoDB is installed and running
   - Default port: 27017

5. **Run Application**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Routes

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Movies
```
GET /api/movies           # Get movies (public)
POST /api/movies         # Add movie (admin)
PUT /api/movies/:id      # Update movie (admin)
DELETE /api/movies/:id   # Delete movie (admin)
```

### Users
```
GET /api/users/admin    # Admin access
GET /api/users/user     # User access
```

## Key Files Explanation

1. **dbConnect.js**:
   - Establishes MongoDB connection
   - Handles connection errors
   - Logs successful connection

2. **authController.js**:
   - User registration with password hashing
   - JWT token generation
   - Login validation

3. **movieController.js**:
   - Movie CRUD operations
   - Search functionality
   - Sorting and pagination
   - Input validation

4. **fetchController.js**:
   - IMDb data scraping logic
   - Data cleaning and formatting
   - Duplicate checking

5. **Middleware**:
   - Token verification
   - Role-based authorization
   - Request validation

## Security Implementations

1. **Authentication**:
   - Password hashing (bcrypt)
   - JWT token verification
   - Session management

2. **Authorization**:
   - Role-based access
   - Protected routes
   - Admin privileges

3. **Data Security**:
   - Input validation
   - Error handling
   - CORS configuration

## Error Handling

- Comprehensive try-catch blocks
- Appropriate HTTP status codes
- Informative error messages
- Global error middleware

## Maintenance

The system includes:
- Automated movie data updates
- Duplicate prevention
- Database indexing
- Logging mechanisms

For detailed implementation specifics, refer to inline comments in each file.