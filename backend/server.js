import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import healthCheckRoutes from './routes/healthCheckRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import remedyRoutes from './routes/remedyRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));







// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000', "https://vercel.com/raghunandan-shahs-projects/health-care-ai", "https://health-care-ai-rb82.vercel.app",
        "https://vercel.com/raghunandan-shahs-projects/health-care-ai-rb82/BAMyN7eAdDYCQqJMW3ngQnz4MGwV",
        "https://health-care-ai-rb82-k5vse6yd5-raghunandan-shahs-projects.vercel.app"
 
        ],
    credentials: true
}));


app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "HealthCare AI Backend is running 🚀"
  });
});


// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health-check', healthCheckRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/remedies', remedyRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Healthcare API is running',
        timestamp: new Date().toISOString()
    });
});

// API documentation
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'AI-Powered Healthcare API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth - Authentication (register, login, profile)',
            healthCheck: '/api/health-check - Photo-based health analysis',
            symptoms: '/api/symptoms - Symptom tracking and analysis',
            remedies: '/api/remedies - Home remedies database',
            medicine: '/api/medicine - Medicine advice and AI chat',
            hospitals: '/api/hospitals - Nearby hospitals and emergency contacts',
            dashboard: '/api/dashboard - Personal health dashboard'
        },
        disclaimer: 'This API provides AI-generated health guidance only. Not a substitute for professional medical advice.'
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
🏥 Healthcare API Server
========================
✅ Server running on port ${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API Docs: http://localhost:${PORT}/api
⚡ Health Check: http://localhost:${PORT}/api/health
  `);
});

export default app;
