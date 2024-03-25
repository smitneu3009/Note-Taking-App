const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv'); // Import dotenv module
const path = require('path'); // Import path module

// Load environment variables from .env file
dotenv.config();

const meetingNotesRouter = require('./routes/meetingNotes');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

console.log("MONGODB_URL:", process.env.MONGODB_URL);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount meeting notes routes
app.use('/meeting-notes', meetingNotesRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
