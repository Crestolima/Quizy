import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import {
    Container,
    Typography,
    Card,
    CircularProgress,
    Grid,
    Alert,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel
} from '@mui/material';
import { styled } from '@mui/system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faQuestionCircle, faClipboardList, faChartLine } from '@fortawesome/free-solid-svg-icons';

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
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        padding: theme.spacing(2),
    },
}));

const IconBox = styled(Box)(({ theme }) => ({
    marginRight: theme.spacing(2),
    fontSize: 40,
    color: theme.palette.primary.main,
    [theme.breakpoints.down('sm')]: {
        marginRight: 0,
        marginBottom: theme.spacing(1),
    },
}));

const CardContentBox = styled(Box)({
    flex: 1,
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
}));

const StyledTable = styled(Table)(({ theme }) => ({
    minWidth: 650,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
}));

const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
    '&.Mui-active': {
        color: theme.palette.primary.main,
    },
}));

const Home = () => {
    const { loggedInUser } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('totalScore');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (loggedInUser) {
                try {
                    const response = await axios.get(`http://localhost:3001/stats?userId=${loggedInUser._id}`);
                    console.log("Dashboard Data:", response.data);
                    setDashboardData(response.data);
                } catch (err) {
                    setError(err);
                    console.error("Error fetching dashboard data:", err);
                }
            }
        };

        fetchDashboardData();
    }, [loggedInUser]);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/leaderboard');
                console.log("Leaderboard Data:", response.data);
                setLeaderboardData(response.data);
            } catch (err) {
                setError(err);
                console.error("Error fetching leaderboard data:", err);
            }
        };

        fetchLeaderboardData();
    }, []);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Sorting the leaderboard data
    const sortedLeaderboardData = leaderboardData ? [...leaderboardData].sort((a, b) => {
        if (orderBy === 'totalScore') {
            return order === 'asc' ? a.totalScore - b.totalScore : b.totalScore - a.totalScore;
        }
        return 0;
    }) : [];

    // Grouping the leaderboard data by course name
    const groupedLeaderboardData = sortedLeaderboardData.reduce((acc, entry) => {
        const courseName = entry.course?.name || 'Unknown Course';
        if (!acc[courseName]) {
            acc[courseName] = [];
        }
        acc[courseName].push(entry);
        return acc;
    }, {});

    if (!loggedInUser) {
        return (
            <Root>
                <Alert severity="warning">Please log in to view the dashboard.</Alert>
            </Root>
        );
    }

    if (error) {
        return (
            <Root>
                <Alert severity="error">Error fetching data: {error.message}</Alert>
            </Root>
        );
    }

    if (!dashboardData || leaderboardData.length === 0) {
        return (
            <Loading>
                <CircularProgress />
            </Loading>
        );
    }

    return (
        <Root>
            <Typography variant="h4" component="h1" gutterBottom>
                Welcome, {loggedInUser.firstName} {loggedInUser.lastName}!
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <IconBox>
                            <FontAwesomeIcon icon={faBook} />
                        </IconBox>
                        <CardContentBox>
                            <Typography variant="h6" component="h2">
                                Total Courses
                            </Typography>
                            <Typography variant="body2" component="p">
                                {dashboardData.totalCourses}
                            </Typography>
                        </CardContentBox>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <IconBox>
                            <FontAwesomeIcon icon={faQuestionCircle} />
                        </IconBox>
                        <CardContentBox>
                            <Typography variant="h6" component="h2">
                                Total MCQs
                            </Typography>
                            <Typography variant="body2" component="p">
                                {dashboardData.totalMcqs}
                            </Typography>
                        </CardContentBox>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <IconBox>
                            <FontAwesomeIcon icon={faClipboardList} />
                        </IconBox>
                        <CardContentBox>
                            <Typography variant="h6" component="h2">
                                Total Tests Taken
                            </Typography>
                            <Typography variant="body2" component="p">
                                {dashboardData.totalTests}
                            </Typography>
                        </CardContentBox>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StyledCard>
                        <IconBox>
                            <FontAwesomeIcon icon={faChartLine} />
                        </IconBox>
                        <CardContentBox>
                            <Typography variant="h6" component="h2">
                                User Score
                            </Typography>
                            <Typography variant="body2" component="p">
                                {dashboardData.averageScore}
                            </Typography>
                        </CardContentBox>
                    </StyledCard>
                </Grid>

                {/* Leaderboard display */}
                <Grid item xs={12}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Leaderboard
                    </Typography>
                    <StyledTableContainer component={Paper}>
                        <StyledTable>
                            <StyledTableHead>
                                <TableRow>
                                    <StyledTableCell>Course</StyledTableCell>
                                    <StyledTableCell>Student</StyledTableCell>
                                    <StyledTableCell sortDirection={orderBy === 'totalScore' ? order : false}>
                                        <StyledTableSortLabel
                                            active={orderBy === 'totalScore'}
                                            direction={orderBy === 'totalScore' ? order : 'asc'}
                                            onClick={() => handleRequestSort('totalScore')}
                                        >
                                            Score
                                        </StyledTableSortLabel>
                                    </StyledTableCell>
                                </TableRow>
                            </StyledTableHead>
                            <TableBody>
                                {Object.entries(groupedLeaderboardData).length > 0 ? (
                                    Object.entries(groupedLeaderboardData).map(([courseName, entries]) => (
                                        entries.map((entry, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{courseName}</TableCell>
                                                <TableCell>{entry.user.firstName} {entry.user.lastName}</TableCell>
                                                <TableCell>{entry.totalScore}</TableCell>
                                            </TableRow>
                                        ))
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            No leaderboard data available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </StyledTable>
                    </StyledTableContainer>
                </Grid>
            </Grid>
        </Root>
    );
};

export default Home;
