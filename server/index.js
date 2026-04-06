const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const initSocket = require('./socket.js');

const authRoutes = require('./routes/authRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const assessmentRoutes = require('./routes/assessmentRoutes.js');
const labRoutes = require('./routes/labRoutes.js');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/labs', labRoutes);

// Communication Routes
const communicationRoutes = require('./routes/communicationRoutes.js');
app.use('/api/communication', communicationRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('EduNexus LMS API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

