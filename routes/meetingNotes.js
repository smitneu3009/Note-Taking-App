// routes/meetingNotes.js

const express = require('express');
const router = express.Router();
const MeetingNote = require('../models/meetingNote');

router.get('/search', async (req, res) => {
    const keywords = req.query.keywords;
    try {
        const searchResults = await MeetingNote.find({
            $or: [
                { title: { $regex: keywords, $options: 'i' } }, // Search in title (case-insensitive)
                { content: { $regex: keywords, $options: 'i' } }, // Search in content (case-insensitive)
                { actionItems: { $regex: keywords, $options: 'i' } } // Search in action items (case-insensitive)
            ]
        });
        res.json(searchResults);
    } catch (err) {
        console.error('Error searching notes:', err); // Log the error
        res.status(500).json({ message: err.message });
    }
});

// Route to fetch all meeting notes
router.get('/', async (req, res) => {
    try {
        const notes = await MeetingNote.find();
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to fetch a specific meeting note by ID
router.get('/:id', getNote, (req, res) => {
    res.json(res.meetingNote);
});

// Route to create a new meeting note
router.post('/', async (req, res) => {
    const note = new MeetingNote({
        title: req.body.title,
        content: req.body.content,
        actionItems: req.body.actionItems
    });
    try {
        const newNote = await note.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Route to update a meeting note
router.patch('/:id', getNote, async (req, res) => {
    if (req.body.title != null) {
        res.meetingNote.title = req.body.title;
    }
    if (req.body.content != null) {
        res.meetingNote.content = req.body.content;
    }
    if (req.body.actionItems != null) {
        res.meetingNote.actionItems = req.body.actionItems;
    }
    try {
        const updatedNote = await res.meetingNote.save();
        res.json(updatedNote);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Route to delete a meeting note
router.delete('/:id', async (req, res) => {
    try {
        const meetingNote = await MeetingNote.findByIdAndDelete(req.params.id);
        if (!meetingNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json({ message: 'Deleted meeting note' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware function to get a specific meeting note by ID
async function getNote(req, res, next) {
    try {
        const meetingNote = await MeetingNote.findById(req.params.id);
        if (meetingNote == null) {
            return res.status(404).json({ message: 'Cannot find meeting note' });
        }
        res.meetingNote = meetingNote;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


module.exports = router;
