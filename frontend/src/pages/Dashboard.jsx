import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiGithub, FiLinkedin, FiLink, FiAward, FiBookOpen, FiTrendingUp, FiInbox, FiTrash2, FiFileText, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { Input, TextArea } from '../components/ui/FormElements';
import { Button } from '../components/ui/button';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [createdBlogs, setCreatedBlogs] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [inbox, setInbox] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ skills: '', achievements: '', github: '', linkedin: '', leetcode: '' });
  const [loading, setLoading] = useState(true);
  const [deletingCourses, setDeletingCourses] = useState(new Set());
  const [deletingBlogs, setDeletingBlogs] = useState(new Set());
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/dashboard');
        setProfile(data.profile);
        setCreatedCourses(data.createdCourses);
        setCreatedBlogs(data.createdBlogs || []);
        setEnrolledCourses(data.enrolledCourses);
        setProgress(data.progress);
        setTotalEarnings(data.totalEarnings);
        setInbox(data.inbox);
        setForm({
          skills: (data.profile.skills || []).join(', '),
          achievements: (data.profile.achievements || []).join(', '),
          github: data.profile.profileLinks?.github || '',
          linkedin: data.profile.profileLinks?.linkedin || '',
          leetcode: data.profile.profileLinks?.leetcode || '',
        });
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put('/users/profile', {
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        achievements: form.achievements.split(',').map(a => a.trim()).filter(Boolean),
        profileLinks: {
          github: form.github,
          linkedin: form.linkedin,
          leetcode: form.leetcode,
        },
      });
      setEditMode(false);
      // Refetch dashboard
      const { data } = await api.get('/users/dashboard');
      setProfile(data.profile);
      setCreatedCourses(data.createdCourses);
      setCreatedBlogs(data.createdBlogs || []);
      setEnrolledCourses(data.enrolledCourses);
      setProgress(data.progress);
      setTotalEarnings(data.totalEarnings);
      setInbox(data.inbox);
    } catch (err) {
      // handle error
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle, e) => {
    e.stopPropagation(); // Prevent navigation
    const confirmed = window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingCourses(prev => new Set(prev).add(courseId));
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully!');
      setCreatedCourses(prev => prev.filter(course => course._id !== courseId));
      // Refetch dashboard to update earnings
      const { data } = await api.get('/users/dashboard');
      setTotalEarnings(data.totalEarnings);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setDeletingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleDeleteBlog = async (blogId, blogTitle, e) => {
    e.stopPropagation(); // Prevent navigation
    const confirmed = window.confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingBlogs(prev => new Set(prev).add(blogId));
    try {
      await api.delete(`/blogs/${blogId}`);
      toast.success('Blog deleted successfully!');
      setCreatedBlogs(prev => prev.filter(blog => blog._id !== blogId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete blog.');
    } finally {
      setDeletingBlogs(prev => {
        const newSet = new Set(prev);
        newSet.delete(blogId);
        return newSet;
      });
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error("Please select a file first.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      // This will be created next
      const { data } = await api.put('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update user context and local state
      const updatedUser = { ...user, avatar: data.avatar };
      setUser(updatedUser);
      setProfile(updatedUser);

      toast.success('Avatar updated successfully!');
      setAvatarFile(null); // Clear the file input
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#232336] to-[#18181b] text-white p-0 m-0">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Your Dashboard</h1>
          <p className="text-lg text-gray-300">Manage your profile, track your learning, and see your achievements!</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="bg-white/10 rounded-2xl p-8 mb-10 shadow-lg">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative group">
              <img src={profile.avatar} alt="avatar" className="w-20 h-20 rounded-full border-4 border-purple-400 shadow" />
              {editMode && (
                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiEdit className="text-white h-8 w-8" />
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">{profile.name}</h2>
              <p className="text-gray-300">{profile.email}</p>
            </div>
            <Button onClick={handleEdit} className="ml-auto" variant="outline"><FiEdit className="inline mr-2" />Edit</Button>
          </div>
          {editMode ? (
            <div>
              {avatarFile && (
                <div className="flex items-center gap-4 mb-4 bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-300 flex-grow">New avatar selected: {avatarFile.name}</p>
                  <Button onClick={handleAvatarUpload} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Now'}
                  </Button>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Input label="Skills (comma separated)" name="skills" value={form.skills} onChange={handleChange} />
                  <Input label="Achievements (comma separated)" name="achievements" value={form.achievements} onChange={handleChange} />
                </div>
                <div>
                  <Input label="GitHub" name="github" value={form.github} onChange={handleChange} icon={<FiGithub />} />
                  <Input label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} icon={<FiLinkedin />} />
                  <Input label="LeetCode" name="leetcode" value={form.leetcode} onChange={handleChange} icon={<FiLink />} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="mb-2 flex items-center gap-2"><FiTrendingUp className="text-purple-400" /> <span className="font-semibold">Skills:</span> <span>{(profile.skills || []).join(', ') || '—'}</span></div>
                <div className="mb-2 flex items-center gap-2"><FiAward className="text-pink-400" /> <span className="font-semibold">Achievements:</span> <span>{(profile.achievements || []).join(', ') || '—'}</span></div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2"><FiGithub className="text-gray-400" /> <a href={profile.profileLinks?.github} target="_blank" rel="noopener noreferrer" className="hover:underline">{profile.profileLinks?.github || '—'}</a></div>
                <div className="mb-2 flex items-center gap-2"><FiLinkedin className="text-blue-400" /> <a href={profile.profileLinks?.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">{profile.profileLinks?.linkedin || '—'}</a></div>
                <div className="mb-2 flex items-center gap-2"><FiLink className="text-yellow-400" /> <a href={profile.profileLinks?.leetcode} target="_blank" rel="noopener noreferrer" className="hover:underline">{profile.profileLinks?.leetcode || '—'}</a></div>
              </div>
            </div>
          )}
          {editMode && (
            <div className="flex gap-4 mt-6">
              <Button onClick={handleSave} variant="primary">Save</Button>
              <Button onClick={handleCancel} variant="secondary">Cancel</Button>
            </div>
          )}
        </motion.div>

        {/* Created Courses Section */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="bg-white/10 rounded-2xl p-8 mb-10 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><FiBookOpen className="text-purple-400" /> Courses You Created</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {createdCourses.length === 0 ? <div className="text-gray-400">No courses created yet.</div> : createdCourses.map(course => (
              <div key={course._id} className="bg-white/5 rounded-xl p-6 shadow flex flex-col gap-2 hover:bg-purple-500/10 transition-all duration-300 relative group">
                <div className="flex items-start justify-between">
                  <div className="flex-grow cursor-pointer" onClick={() => navigate(`/courses/${course._id}/edit`)}>
                    <div className="font-semibold text-lg">{course.title}</div>
                    <div className="text-sm text-gray-300">Earnings: ₹{course.earnings || 0}</div>
                    <div className="text-sm text-gray-300">Price: ₹{course.price || 0}</div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteCourse(course._id, course.title, e)}
                    disabled={deletingCourses.has(course._id)}
                    className="p-2 rounded-full transition-colors hover:bg-red-500/20 text-red-400 hover:text-red-300 disabled:opacity-50 opacity-0 group-hover:opacity-100"
                    aria-label="Delete course"
                  >
                    {deletingCourses.has(course._id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    ) : (
                      <FiTrash2 />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right text-lg font-bold text-green-400">Total Earnings: ₹{totalEarnings}</div>
        </motion.div>

        {/* Created Blogs Section */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.35 }} className="bg-white/10 rounded-2xl p-8 mb-10 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><FiFileText className="text-green-400" /> Blogs You Created</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {createdBlogs.length === 0 ? <div className="text-gray-400">No blogs created yet.</div> : createdBlogs.map(blog => (
              <div key={blog._id} className="bg-white/5 rounded-xl p-6 shadow flex flex-col gap-2 hover:bg-green-500/10 transition-all duration-300 relative group">
                <div className="flex items-start justify-between">
                  <div className="flex-grow cursor-pointer" onClick={() => navigate(`/blogs/${blog._id}`)}>
                    <div className="font-semibold text-lg">{blog.title}</div>
                    <div className="text-sm text-gray-300">Tag: {blog.tag}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-300 mt-2">
                      <div className="flex items-center gap-1">
                        <FiThumbsUp className="text-green-400" />
                        <span>{blog.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiThumbsDown className="text-red-400" />
                        <span>{blog.downvotes}</span>
                      </div>
                      <div className="text-gray-400">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteBlog(blog._id, blog.title, e)}
                    disabled={deletingBlogs.has(blog._id)}
                    className="p-2 rounded-full transition-colors hover:bg-red-500/20 text-red-400 hover:text-red-300 disabled:opacity-50 opacity-0 group-hover:opacity-100"
                    aria-label="Delete blog"
                  >
                    {deletingBlogs.has(blog._id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    ) : (
                      <FiTrash2 />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enrolled Courses Section */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="bg-white/10 rounded-2xl p-8 mb-10 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><FiTrendingUp className="text-pink-400" /> Courses You're Enrolled In</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {enrolledCourses.length === 0 ? <div className="text-gray-400">Not enrolled in any courses yet.</div> : enrolledCourses.map(course => {
              const prog = progress.find(p => p.courseId === course._id) || { percent: 0 };
              return (
                <div key={course._id} className="bg-white/5 rounded-xl p-6 shadow flex flex-col gap-2 hover:bg-pink-500/10 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/courses/${course._id}/content`)}>
                  <div className="font-semibold text-lg">{course.title}</div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full" style={{ width: `${prog.percent}%` }}></div>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">Progress: {prog.percent}%</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Inbox Section */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="bg-white/10 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><FiInbox className="text-blue-400" /> Inbox / Messages</h3>
          <div className="space-y-4">
            {inbox.length === 0 ? (
              <div className="text-gray-400">No messages yet.</div>
            ) : (
              inbox.map(chat => {
                const otherUser = chat.users.find(u => u._id !== profile._id);
                if (!otherUser) return null;
                return (
                  <div
                    key={chat._id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
                    onClick={() => navigate(`/chat/${chat._id}`)}
                  >
                    <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full" />
                    <div className="flex-grow">
                      <h4 className="font-semibold">{otherUser.name}</h4>
                      <p className="text-sm text-gray-400 truncate">{chat.lastMessage?.content || '...'}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 