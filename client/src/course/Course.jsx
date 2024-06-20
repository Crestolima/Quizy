import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, CircularProgress, Button, Modal, Box, TextField, Card, CardContent, CardActions, CardMedia, Container } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../AuthContext';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const styles = `
@keyframes disintegrate {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(100px);
  }
}

.disintegrate {
  animation: disintegrate 0.5s forwards;
}
`;

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newCourseData, setNewCourseData] = useState({ name: '', description: '', duration: '', instructor: '', image: null });
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const { loggedInUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/courses');
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleOpenModal = () => {
    setNewCourseData({ ...newCourseData, instructor: `${loggedInUser.firstName} ${loggedInUser.lastName}` });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourseData({ ...newCourseData, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewCourseData({ ...newCourseData, image: e.target.files[0] });
  };

  const handleCreateCourse = async () => {
    if (!loggedInUser) {
      toast.error('You need to be logged in to create a course');
      return;
    }

    const formData = new FormData();
    formData.append('name', newCourseData.name);
    formData.append('description', newCourseData.description);
    formData.append('duration', newCourseData.duration);
    formData.append('instructor', newCourseData.instructor);
    formData.append('image', newCourseData.image);

    try {
      await axios.post('http://localhost:3001/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewCourseData({ name: '', description: '', duration: '', instructor: '', image: null });
      handleCloseModal();
      const response = await axios.get('http://localhost:3001/courses');
      setCourses(response.data);
      toast.success('Course created successfully');
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const handleDeleteCourse = async (id) => {
    setDeletingCourseId(id);
    setTimeout(async () => {
      try {
        await axios.delete(`http://localhost:3001/courses/${id}`);
        const updatedCourses = courses.filter(course => course._id !== id);
        setCourses(updatedCourses);
        toast.success('Course deleted successfully');
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      } finally {
        setDeletingCourseId(null);
      }
    }, 500); // Match the duration of the disintegrate animation
  };

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesOptions = {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#000000",
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000",
        },
      },
      opacity: {
        value: 0.5,
        random: false,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          size_min: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: false,
        distance: 150,
        color: "#000000",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 6,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: false,
          mode: "repulse",
        },
        onclick: {
          enable: false,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 400,
          line_linked: {
            opacity: 1,
          },
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          particles_nb: 4,
        },
        remove: {
          particles_nb: 2,
        },
      },
    },
    retina_detect: true,
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <style>{styles}</style>
      <ToastContainer />
      <Typography variant="h4" gutterBottom>Courses</Typography>
      <Button variant="contained" color="primary" onClick={handleOpenModal}>Add New Course</Button>
      <Grid container spacing={2} style={{ marginTop: '16px' }}>
        {courses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card
              className={deletingCourseId === course._id ? 'disintegrate' : ''}
              style={{ borderRadius: 16, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', position: 'relative' }}
            >
              {deletingCourseId === course._id && (
                <Particles
                  id="tsparticles"
                  init={particlesInit}
                  options={particlesOptions}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {course.imageUrl && (
                <CardMedia
                  component="img"
                  alt={course.name}
                  height="140"
                  image={`http://localhost:3001/${course.imageUrl}`}
                  style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>{course.name}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>{course.description}</Typography>
                <Typography variant="body2" color="textSecondary">Duration: {course.duration}</Typography>
                <Typography variant="body2" color="textSecondary">Instructor: {course.instructor}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="secondary" onClick={() => handleDeleteCourse(course._id)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">Add New Course</Typography>
          <TextField
            fullWidth
            margin="normal"
            name="name"
            label="Course Name"
            value={newCourseData.name}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="description"
            label="Description"
            value={newCourseData.description}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="duration"
            label="Duration"
            value={newCourseData.duration}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="instructor"
            label="Publisher"
            value={newCourseData.instructor}
            onChange={handleInputChange}
            disabled
          />
          <input type="file" onChange={handleFileChange} />
          <Button variant="contained" color="primary" onClick={handleCreateCourse} style={{ marginTop: '16px' }}>Create Course</Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default Course;
