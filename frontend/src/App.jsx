import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import BrowseCourses from './pages/Courses/BrowseCourses';
import CreateCourse from './pages/CreateCourse';
import AddChapters from './pages/AddChapters';
import PayCourse from './pages/Courses/PayCourse';
import CourseContent from './pages/Courses/CourseContent';
import CourseDetails from './pages/Courses/CourseDetails';
import SuccessPage from './pages/SuccessPage';
import CourseCreated from './pages/CourseCreated';
import EditCourse from './pages/EditCourse';
import EditSuccess from './pages/EditSuccess';
import ManageChapters from './pages/ManageChapters';
import StripeRedirect from './pages/Courses/StripeRedirect';
import UserProfile from './pages/UserProfile';

import CreateBlog from './pages/Blog/CreateBlog';
import AllBlogs from './pages/Blog/AllBlogs';
import ViewBlog from './pages/Blog/ViewBlog';

import { useAuth } from './context/AuthContext';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Dashboard from './pages/Dashboard';
import FindTeammates from './pages/FindTeammates';
import Chat from './pages/Chat';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="w-full min-h-screen mt-20">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/blogs" element={<AllBlogs />} />
          <Route path="/blogs/:id" element={<ViewBlog />} />

          {/* Protected Routes - Browse Courses */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <BrowseCourses />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Blog Form */}
          <Route
            path="/blogform"
            element={
              <ProtectedRoute>
                <CreateBlog />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/create-course"
            element={
              <ProtectedRoute>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create/course"
            element={
              <ProtectedRoute>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-chapters/:courseId"
            element={
              <ProtectedRoute>
                <AddChapters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/add-chapters"
            element={
              <ProtectedRoute>
                <AddChapters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-created-success/:courseId"
            element={
              <ProtectedRoute>
                <CourseCreated />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:courseId"
            element={
              <ProtectedRoute>
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/edit"
            element={
              <ProtectedRoute>
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-success/:courseId"
            element={
              <ProtectedRoute>
                <EditSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-chapters/:courseId"
            element={
              <ProtectedRoute>
                <ManageChapters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/manage-chapters"
            element={
              <ProtectedRoute>
                <ManageChapters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-blog"
            element={
              <ProtectedRoute>
                <CreateBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs"
            element={
              <AllBlogs />
            }
          />
          <Route
            path="/courses/:courseId/pay"
            element={
              <ProtectedRoute>
                <PayCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/content"
            element={
              <ProtectedRoute>
                <CourseContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-teammates"
            element={
              <ProtectedRoute>
                <FindTeammates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId?"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
