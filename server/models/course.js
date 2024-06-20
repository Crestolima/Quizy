const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    category: String,
    imageUrl: String // Add imageUrl field
});

const CourseModel = mongoose.model("Course", CourseSchema);
module.exports = CourseModel;
