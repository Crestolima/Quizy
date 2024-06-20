import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Alert,
    Box
} from '@mui/material';
import { styled } from '@mui/system';

const Root = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const Loading = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
});

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderRadius: '12px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.background.paper,
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        padding: theme.spacing(2),
    },
}));

const Leaderboard = () => {
    const { courseId } = useParams();
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/leaderboard/${courseId}`);
                setLeaderboardData(response.data);
            } catch (err) {
                setError(err);
                console.error("Error fetching leaderboard data:", err);
            }
        };

        fetchLeaderboardData();
    }, [courseId]);

    if (error) {
        return (
            <Root>
                <Alert severity="error">Error fetching data: {error.message}</Alert>
            </Root>
        );
    }

    if (!leaderboardData) {
        return (
            <Loading>
                <CircularProgress />
            </Loading>
        );
    }

    return (
        <Root>
            <Typography variant="h4" component="h1" gutterBottom>
                Leaderboard
            </Typography>
            <Grid container spacing={3}>
                {leaderboardData.map((entry, index) => (
                    <Grid item xs={12} key={index}>
                        <StyledCard>
                            <Box flex={1}>
                                <Typography variant="h6" component="h2">
                                    {entry.userDetails.firstName} {entry.userDetails.lastName}
                                </Typography>
                                <Typography variant="body2" component="p">
                                    Score: {entry.score} / {entry.totalQuestions}
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>
        </Root>
    );
};

export default Leaderboard;
