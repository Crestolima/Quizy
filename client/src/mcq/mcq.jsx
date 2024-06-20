import React, { useState, useEffect } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Grid,
    MenuItem,
    Box,
    Switch,
    FormControl,
    FormGroup,
    FormLabel,
    FormControlLabel,
    Paper,
    Checkbox
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MCQForm() {
    const [course, setCourse] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctOptions, setCorrectOptions] = useState([]);
    const [isMultipleAnswer, setIsMultipleAnswer] = useState(false);
    const [courses, setCourses] = useState([]);
    const [mcqs, setMcqs] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [mcqId, setMcqId] = useState('');
    const [showMCQs, setShowMCQs] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchMCQs();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:3001/courses');
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchMCQs = async () => {
        try {
            const response = await fetch('http://localhost:3001/mcqs/grouped');
            const data = await response.json();
            setMcqs(data);
        } catch (error) {
            console.error('Error fetching MCQs:', error);
        }
    };

    const fetchMCQDetails = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/mcqs/${id}`);
            const data = await response.json();
            setCourse(data.course);
            setQuestion(data.question);
            setOptions(data.options);
            setCorrectOptions(data.correctOptions || []);
            setIsMultipleAnswer(data.isMultipleAnswer || false);
            setMcqId(data._id);
            setEditMode(true);
        } catch (error) {
            console.error('Error fetching MCQ details:', error);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCorrectOptionChange = (index) => {
        const newCorrectOptions = [...correctOptions];
        if (newCorrectOptions.includes(index)) {
            setCorrectOptions(newCorrectOptions.filter((i) => i !== index));
        } else {
            if (isMultipleAnswer) {
                newCorrectOptions.push(index);
            } else {
                newCorrectOptions.splice(0, newCorrectOptions.length, index);
            }
            setCorrectOptions(newCorrectOptions);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (correctOptions.length === 0) {
            toast.error('Please select at least one correct option');
            return;
        }

        const formData = {
            course: course,
            question: question,
            options: options,
            correctOptions: correctOptions,
            isMultipleAnswer: isMultipleAnswer
        };

        console.log('Form Data:', formData);

        const url = editMode ? `http://localhost:3001/mcqs/${mcqId}` : 'http://localhost:3001/mcqs';
        const method = editMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit MCQ');
            }

            const createdMCQ = await response.json();
            console.log('Submitted MCQ:', createdMCQ);

            setCourse('');
            setQuestion('');
            setOptions(['', '', '', '']);
            setCorrectOptions([]);
            setIsMultipleAnswer(false);
            setEditMode(false);
            setMcqId('');

            toast.success('MCQ submitted successfully');
            fetchMCQs();
        } catch (error) {
            console.error('Error submitting MCQ:', error);
            toast.error('Failed to submit MCQ');
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/mcqs/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete MCQ');
            }

            toast.success('MCQ deleted successfully');
            fetchMCQs();
        } catch (error) {
            console.error('Error deleting MCQ:', error);
            toast.error('Failed to delete MCQ');
        }
    };

    const renderMCQs = () => {
        return mcqs.map((group) => (
            <Box key={group._id} mb={4}>
                <Typography variant="h6">{group.courseDetails[0]?.name}</Typography>
                {group.mcqs.map((mcq) => (
                    <Box key={mcq._id} mt={2} mb={2} p={2} border={1} borderColor="grey.300" borderRadius={4}>
                        <Typography>{mcq.question}</Typography>
                        <Button variant="contained" color="primary" onClick={() => fetchMCQDetails(mcq._id)} sx={{ mr: 1 }}>
                            Edit
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => handleDelete(mcq._id)}>
                            Delete
                        </Button>
                    </Box>
                ))}
            </Box>
        ));
    };

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">{editMode ? 'Edit MCQ' : 'Create MCQ'}</Typography>
                <FormControlLabel
                    control={<Switch checked={showMCQs} onChange={() => setShowMCQs(!showMCQs)} />}
                    label="Show MCQs"
                />
            </Box>

            {showMCQs ? (
                <Paper elevation={3} sx={{ padding: 2 }}>
                    {renderMCQs()}
                </Paper>
            ) : (
                <Paper elevation={3} sx={{ padding: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            select
                            label="Course"
                            fullWidth
                            margin="normal"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                        >
                            {courses.map((course, index) => (
                                <MenuItem key={index} value={course._id}>
                                    {course.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Question"
                            fullWidth
                            margin="normal"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <Grid container spacing={2}>
                            {options.map((option, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <TextField
                                        label={`Option ${index + 1}`}
                                        fullWidth
                                        margin="normal"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isMultipleAnswer}
                                    onChange={(e) => setIsMultipleAnswer(e.target.checked)}
                                />
                            }
                            label="Multiple Correct Answers"
                        />
                        <FormControl component="fieldset" margin="normal">
                            <FormLabel component="legend">Correct Options</FormLabel>
                            <FormGroup row>
                                {options.map((option, index) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={correctOptions.includes(index)}
                                                onChange={() => handleCorrectOptionChange(index)}
                                                name={`option${index}`}
                                            />
                                        }
                                        label={`Option ${index + 1}`}
                                        key={index}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
                        <Box mt={2}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Submit
                            </Button>
                        </Box>
                    </form>
                </Paper>
            )}
            <ToastContainer />
        </Container>
    );
}

export default MCQForm;
