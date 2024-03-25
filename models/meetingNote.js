// models/MeetingNote.js

const mongoose = require('mongoose');

const meetingNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  actionItems: {
    type: [String],
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const MeetingNote = mongoose.model('MeetingNote', meetingNoteSchema);

module.exports = MeetingNote;
