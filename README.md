# SkillVerse - Online Learning Platform

A full-stack web application for creating, sharing, and learning from courses, with social features for connecting with other learners.

## Features

- Course Creation and Management
- Course Enrollment and Progress Tracking
- User Connection and Chat System
- Blog Creation and Sharing
- Real-time Chat Functionality

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Real-time Communication: Socket.io
- File Storage: Cloudinary

## Project Structure

```
saas-course-platform/
├── backend/         # Node.js + Express backend
├── frontend/        # React + Vite frontend
```

## Setup Instructions

### 🧪 Running the Application

To run the application, you need to start both the frontend and backend servers simultaneously in separate terminals.

**1. Start the Backend Server:**

```bash
cd backend
npm install
npm run dev
```
The backend will run on `http://localhost:5000`.

**2. Start the Frontend Server:**

```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:3001`.

### 🔧 Environment Variables

Create a `.env` file in the `backend` directory and add the following:

```env
# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Email (for password reset) - Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_NAME=SkillVerse
FROM_EMAIL=noreply@skillverse.com

# Frontend URL (for deployment)
# For local development, this defaults to http://localhost:3001
# For Netlify/Vercel, set this to your production frontend URL
FRONTEND_URL=https://your-app-name.netlify.app
```

### 🚀 Deployment

When deploying to a service like Netlify (frontend) and Heroku/Render (backend), make sure to set the environment variables in the respective service's dashboard.

**For the password reset link to work in production, it is crucial to set the `FRONTEND_URL` environment variable on your backend hosting service.**

---

Happy coding! 🚀

## Available Scripts

### Backend
- `npm run dev`: Start development server
- `npm start`: Start production server
- `npm test`: Run tests

### Frontend
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 