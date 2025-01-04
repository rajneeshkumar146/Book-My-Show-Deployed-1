const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

// Load env Variables.
require('dotenv').config();

// Constants
const PORT = process.env.PORT;

// Setup
const app = express();
app.use(express.json()); // Middleware

// // If getting csp:blocked error.
// app.use(
//     helmet({
//         contentSecurityPolicy: {
//             directives: {
//                 defaultSrc: ["'self'"],
//                 scriptSrc: [
//                     "'self'",
//                     "'unsafe-inline'",
//                     "'unsafe-eval'",
//                     "https://your-production-url.com", // Replace with your actual production URL
//                 ],
//                 styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//                 imgSrc: ["'self'", "data:", "https://your-production-url.com"], // Replace with your actual production URL
//                 connectSrc: ["'self'", "https://your-production-url.com"], // Your API domain
//                 fontSrc: ["'self'", "https://fonts.gstatic.com"],
//                 objectSrc: ["'none'"],
//                 upgradeInsecureRequests: [],
//             },
//         },
//     })
// );

app.use(
    cors({
        origin: "*", // Allow only your frontend origin
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

const clientBuildPath = path.join(__dirname, "../client/build");
console.log(clientBuildPath);

app.use(express.static(clientBuildPath));
app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Data base connection.
const connectDb = require("./config/db");
connectDb(); // Stablish database connection.

// Use helmet for setting various HTTP headers for security
app.use(helmet());
// Custom Content Security Policy (CSP) configuration
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "example.com"], // Allow scripts from 'self' and example.com
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (unsafe)
            imgSrc: ["'self'", "data:", "example.com"], // Allow images from 'self', data URLs, and example.com
            connectSrc: ["'self'", "api.example.com"], // Allow connections to 'self' and api.example.com
            fontSrc: ["'self'", "fonts.gstatic.com"], // Allow fonts from 'self' and fonts.gstatic.com
            objectSrc: ["'none'"], // Disallow object, embed, and applet elements
            upgradeInsecureRequests: [], // Upgrade insecure requests to HTTPS
        },
    })
);

// Rate limiter middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`.
    message: "Too many requests from this IP, please try again after 15 minutes"
});


// Apply rate limiter to all API routes
app.use("/api/", apiLimiter);

// Sanitize user input to prevent MongoDB Operator Injection
app.use(mongoSanitize());

// Global Variables
const USER_ROUTER = require("./routes/userRouter");
const MOVIE_ROUTER = require("./routes/movieRoute");
const THEATER_ROUTER = require("./routes/theatreRoute");
const SHOW_ROUTER = require("./routes/showRoute");
const BOOKING_ROUTER = require("./routes/bookingRoute");

// Routes.
app.use("/api/users", USER_ROUTER);
app.use("/api/movies", MOVIE_ROUTER);
app.use("/api/theatres", THEATER_ROUTER);
app.use("/api/shows", SHOW_ROUTER);
app.use("/api/bookings", BOOKING_ROUTER);

app.get("/", (req, res) =>
    res.status(201).send("Welcome to the home page.")
);

app.use((req, res) =>
    res.status(404).json({ message: "page not found" })
);

app.listen(PORT, () => {
    console.log("Server is running on port PORT");
})

