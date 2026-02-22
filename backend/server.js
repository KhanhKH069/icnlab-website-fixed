const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const publicationRoutes = require('./routes/publications');
const projectRoutes = require('./routes/projects');
const memberRoutes = require('./routes/members');

const app = express();

// Middleware - CORS: allow Frontend (3000) and Admin (3001)
const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001';
const corsOrigins = corsOriginEnv.split(',').map(o => o.trim());
const allowAll = corsOrigins.includes('*');
app.use(cors({
    origin: (origin, callback) => {
        if (allowAll || !origin || corsOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/members', memberRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'ICN Lab API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

// Get local IP address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
}

// Listen on all interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIPAddress();
    console.log('\n🚀 ====================================');
    console.log('   ICN Lab Backend Server Started!');
    console.log('====================================');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Local:   http://localhost:${PORT}`);
    console.log(`🌐 Network: http://${localIP}:${PORT}`);
    console.log('====================================\n');
});

module.exports = app;
