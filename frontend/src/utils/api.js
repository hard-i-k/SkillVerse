import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// ✅ Automatically attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------
// ✅ Exported API methods
// ---------------------------------------------

// ----------------- AUTH ----------------------
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

export const googleLogin = async (googleToken) => {
  const response = await api.post('/auth/google', { token: googleToken });
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

// ----------------- COURSES --------------------
export const createCourse = async (formData) => {
  return await api.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCourse = async (courseId) => {
  return await api.get(`/courses/${courseId}`);
};

export const deleteCourse = async (courseId) => {
  return await api.delete(`/courses/${courseId}`);
};

export const addChapters = async (courseId, formData) => {
  return await api.post(`/courses/${courseId}/chapters`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const listCourses = async () => {
  return await api.get('/courses');
};

// ----------------- ENROLLMENT -----------------
export const enrollInCourse = async (courseId) => {
  return await api.post(`/courses/${courseId}/enroll`);
};

export const getEnrolledCourses = async () => {
  return await api.get('/users/enrolled-courses');
};

// ----------------- PAYMENTS -------------------
export const createCheckoutSession = async (courseId) => {
  return await api.post('/payments/create-checkout-session', { courseId });
};

export const verifyStripeSession = async (sessionId, courseId) => {
  return await api.get(`/payments/verify/${sessionId}?courseId=${courseId}`);
};

// ----------------- BLOGS ----------------------
export const createBlog = async (blogData) => {
  return await api.post('/blogs', blogData);
};

export const getAllBlogs = async () => {
  return await api.get('/blogs');
};

export const voteBlog = async (id, type) => {
  // type = 'upvote' | 'downvote'
  return await api.patch(`/blogs/${id}/vote?type=${type}`);
};

export const deleteBlog = async (id) => {
  return await api.delete(`/blogs/${id}`);
};

export const getDashboard = async () => {
  return await api.get('/users/dashboard');
};

export const updateProfile = async (profileData) => {
  return await api.put('/users/profile', profileData);
};

// ----------------- CHAT -----------------------
export const listUsers = async (query) => {
  return await api.get(`/users${query ? `?q=${encodeURIComponent(query)}` : ''}`);
};

export const getOrStartChat = async (userId) => {
  return await api.post('/chats/chat', { userId });
};

export const getUserChats = async () => {
  return await api.get('/chats/chats');
};

export const getChatMessages = async (chatId) => {
  return await api.get(`/chats/chats/${chatId}/messages`);
};

export const sendMessage = async (chatId, content) => {
  return await api.post(`/chats/chats/${chatId}/messages`, { chatId, content });
};

export const markMessagesRead = async (chatId) => {
  return await api.post(`/chats/chats/${chatId}/read`);
};

export default api;
