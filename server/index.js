const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");

// Import Mongoose models
const UserModel = require('./models/user');
const CourseModel = require('./models/course');
const MCQModel = require('./models/MCQModel');
const TestModel = require('./models/test');

MONGODB_URI = "mongodb+srv://JohnnyCage:x111y000@cluster0.m9ftq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["https"],
    methods: ["POST","GET"],
    credentials: true
}));
app.use('/uploads', express.static('uploads'));

app.use(express.static(path.join(__dirname, '../client')));

// Serve the index.html file for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});

// Connect to MongoDB database
// Connect to MongoDB Atlas database
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.log("Failed to connect to MongoDB Atlas", err));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// User Routes

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.json({ firstName: user.firstName, lastName: user.lastName, email: user.email, _id: user._id });
            } else {
                res.status(400).json({ error: "The Password Is Incorrect" });
            }
        } else {
            res.status(404).json({ error: "No User Detected" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Signup route
app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ firstName, lastName, email, password: hash });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Course Routes

// Create course route with image upload
app.post('/courses', upload.single('image'), async (req, res) => {
    const { name, description, duration, instructor } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    try {
        const newCourse = await CourseModel.create({
            name, description, duration, instructor, imageUrl
        });
        res.json(newCourse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all courses route
app.get('/courses', async (req, res) => {
    try {
        const courses = await CourseModel.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get recent courses route
app.get('/courses/recent', async (req, res) => {
    try {
        const recentCourses = await CourseModel.find().sort({ createdAt: -1 }).limit(5);
        res.json(recentCourses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete course route
app.delete('/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCourse = await CourseModel.findByIdAndDelete(id);
        if (deletedCourse) {
            res.json({ message: "Course deleted successfully" });
        } else {
            res.status(404).json({ error: "Course not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// MCQ Routes

// Create MCQ route
app.post('/mcqs', async (req, res) => {
    const { course, question, options, correctOptions, isMultipleAnswer } = req.body;

    // Validate correct options
    if (!Array.isArray(correctOptions) || correctOptions.length === 0) {
        return res.status(400).json({ error: "At least one correct option must be provided" });
    }

    try {
        const mcq = new MCQModel({
            course,
            question,
            options,
            correctOptions,
            isMultipleAnswer
        });
        const savedMCQ = await mcq.save();
        res.json(savedMCQ);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all MCQs route
app.get('/mcqs', async (req, res) => {
    try {
        const mcqs = await MCQModel.find().populate('course', 'name');
        res.json(mcqs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get MCQs for a specific course
app.get('/mcqs/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const mcqs = await MCQModel.find({ course: courseId }).populate('course', 'name');
        if (mcqs.length > 0) {
            res.json(mcqs);
        } else {
            res.status(404).json({ message: "No MCQs found for this course" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get grouped MCQs
app.get('/mcqs/grouped', async (req, res) => {
    try {
        const groups = await MCQModel.aggregate([
            { $group: { _id: '$course', mcqs: { $push: '$$ROOT' } } },
            { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseDetails' } }
        ]);
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single MCQ route
app.get('/mcqs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const mcq = await MCQModel.findById(id).populate('course', 'name');
        res.json(mcq);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update MCQ route
app.put('/mcqs/:id', async (req, res) => {
    const { id } = req.params;
    const { course, question, options, correctOptions, isMultipleAnswer } = req.body;

    // Validate correct options
    if (!Array.isArray(correctOptions) || correctOptions.length === 0) {
        return res.status(400).json({ error: "At least one correct option must be provided" });
    }

    try {
        const updatedMCQ = await MCQModel.findByIdAndUpdate(
            id,
            { course, question, options, correctOptions, isMultipleAnswer },
            { new: true }
        ).populate('course', 'name');
        if (!updatedMCQ) {
            return res.status(404).json({ error: "MCQ not found" });
        }
        res.json(updatedMCQ);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete MCQ route
app.delete('/mcqs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedMCQ = await MCQModel.findByIdAndDelete(id);
        if (deletedMCQ) {
            res.json({ message: "MCQ deleted successfully" });
        } else {
            res.status(404).json({ error: "MCQ not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Test Routes

// Create test route
app.post('/tests', async (req, res) => {
    const { user, course, score, totalQuestions } = req.body;
    if (!user || !course || score === undefined || totalQuestions === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const foundUser = await UserModel.findOne({ firstName: user.firstName, lastName: user.lastName });
        if (!foundUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const foundCourse = await CourseModel.findById(course);
        if (!foundCourse) {
            return res.status(404).json({ error: "Course not found" });
        }

        const newTest = new TestModel({
            user: foundUser._id,
            course: foundCourse._id,
            score,
            totalQuestions
        });

        const savedTest = await newTest.save();
        res.json(savedTest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tests route
app.get('/tests', async (req, res) => {
    try {
        const tests = await TestModel.find().populate('user').populate('course');
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get test results by user ID
app.get('/tests/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const tests = await TestModel.find({ user: userId }).populate('course');
        if (tests.length > 0) {
            res.json(tests);
        } else {
            res.status(404).json({ message: "No test results found for this user" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get test results by course ID
app.get('/tests/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const tests = await TestModel.find({ course: courseId }).populate('user');
        if (tests.length > 0) {
            res.json(tests);
        } else {
            res.status(404).json({ message: "No test results found for this course" });
        }
    } catch (err) {
        res.status (500).json({ error: err.message });
    }
});

// Get test results for a specific user and course
app.get('/tests/user/:userId/course/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;
    try {
        const testResults = await TestModel.find({
            user: userId,
            course: courseId
        }).populate('user').populate('course');
        if (testResults.length > 0) {
            res.json(testResults);
        } else {
            res.status(404).json({ message: "No test results found for this user and course" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get aggregated test results
app.get('/tests/aggregated', async (req, res) => {
    try {
        const aggregatedResults = await TestModel.aggregate([
            {
                $group: {
                    _id: "$course",
                    averageScore: { $avg: "$score" },
                    totalTests: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "courseDetails"
                }
            }
        ]);
        res.json(aggregatedResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// New Routes for Stats and Leaderboard

// Get overall stats
app.get('/stats', async (req, res) => {
    try {
        const totalUsers = await UserModel.countDocuments();
        const totalCourses = await CourseModel.countDocuments();
        const totalMcqs = await MCQModel.countDocuments();
        const totalTests = await TestModel.countDocuments();
        const averageScore = await TestModel.aggregate([
            { $group: { _id: null, avgScore: { $avg: "$score" } } },
            { $project: { _id: 0, avgScore: 1 } }
        ]);

        res.json({
            totalUsers,
            totalCourses,
            totalMcqs,
            totalTests,
            averageScore: averageScore[0] ? averageScore[0].avgScore : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await TestModel.aggregate([
            { $group: { _id: { user: "$user", course: "$course" }, totalScore: { $sum: "$score" } } },
            { $sort: { totalScore: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id.user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id.course",
                    foreignField: "_id",
                    as: "courseDetails"
                }
            },
            { $unwind: "$courseDetails" },
            {
                $project: {
                    _id: 0,
                    user: "$userDetails",
                    course: "$courseDetails",
                    totalScore: 1
                }
            }
        ]);

        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
