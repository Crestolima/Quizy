// models/MCQModel.js
const mongoose = require('mongoose');

const MCQSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptions: [{ type: Number, required: true }],
    isMultipleAnswer: { type: Boolean, default: false } // New flag for multiple answers
});

module.exports = mongoose.model('MCQ', MCQSchema);
