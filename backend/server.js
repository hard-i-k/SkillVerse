// server.js (ES Module version)

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import blogRoutes from './routes/blogRoutes.js'; // ✅ Import blog routes
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// --- Self-ping to prevent Render from sleeping ---
import axios from 'axios';

dotenv.config();
connectDB();
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);

const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000' , 'https://skilled-verse.netlify.app'];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ✅ Added PATCH here
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

// ✅ Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

const SELF_PING_URL = 'https://skillverse-0656.onrender.com/'; 
const SELF_PING_INTERVAL = 30000; 
function selfPing() {
  axios.get(SELF_PING_URL)
    .then(response => {
      console.log(`Self-ping at ${new Date().toISOString()}: Status ${response.status}`);
    })
    .catch(error => {
      console.error(`Self-ping error at ${new Date().toISOString()}:`, error.message);
    });
}

setInterval(selfPing, SELF_PING_INTERVAL);
