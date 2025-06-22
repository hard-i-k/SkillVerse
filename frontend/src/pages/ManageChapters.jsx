// ✅ Final ManageChapters Component - Fully functional with Add, Edit, Delete, Reorder, Save, Upload Progress
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiVideo, FiFileText, FiHelpCircle, FiPlus, FiTrash2, FiMove,
  FiEye, FiSave, FiArrowRight, FiLoader, FiCheck, FiX, FiChevronUp, FiChevronDown
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { Input, TextArea, Button } from '../components/ui/FormElements';

const ManageChapters = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [reordering, setReordering] = useState(false);

  const [newChapter, setNewChapter] = useState({
    title: '',
    description: '',
    type: 'video',
    file: null,
    quiz: { 
      title: '', 
      questions: [{ 
        question: '', 
        options: ['', '', '', ''], 
        correctIndex: 0 
      }] 
    }
  });

  const fetchChapters = useCallback(async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}/content`);
      setChapters(data.chapters.map(ch => ({
        ...ch,
        isEditing: false,
        uploadProgress: 0,
        type: ch.videoUrl ? 'video' : ch.pdfUrl ? 'pdf' : 'quiz',
        quiz: ch.quiz ? {
          title: ch.quiz.title || '',
          questions: ch.quiz.questions || []
        } : null
      })));
    } catch (err) {
      toast.error('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleSelectChapter = (id) => {
    setSelectedChapterId(id);
    setIsAddingNew(false);
  };

  const handleChapterChange = (id, field, value) => {
    setChapters(prev =>
      prev.map(ch => (ch._id === id ? { ...ch, [field]: value } : ch))
    );
  };

  const handleFileChange = (id, file) => {
    setChapters(prev =>
      prev.map(ch => (ch._id === id ? { ...ch, newFile: file } : ch))
    );
  };

  const handleQuizChange = (id, qIdx, field, value, optIdx) => {
    setChapters(prev =>
      prev.map(ch => {
        if (ch._id !== id) return ch;
        const quiz = { ...ch.quiz };
        if (field === 'title') {
          quiz.title = value;
        } else if (field === 'addQuestion') {
          quiz.questions.push({ question: '', options: ['', '', '', ''], correctIndex: 0 });
        } else if (field === 'removeQuestion') {
          quiz.questions.splice(qIdx, 1);
        } else {
          const questions = [...quiz.questions];
          const question = { ...questions[qIdx] };
          if (field === 'question') question.question = value;
          else if (field === 'correctIndex') question.correctIndex = parseInt(value);
          else if (field === 'option') question.options[optIdx] = value;
          questions[qIdx] = question;
          quiz.questions = questions;
        }
        return { ...ch, quiz };
      })
    );
  };

  const handleReorderChapter = async (id, direction) => {
    const currentIndex = chapters.findIndex(ch => ch._id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= chapters.length) return;

    setReordering(true);
    const newChapters = [...chapters];
    [newChapters[currentIndex], newChapters[newIndex]] = [newChapters[newIndex], newChapters[currentIndex]];
    setChapters(newChapters);

    try {
      const chapterIds = newChapters.map(ch => ch._id);
      await api.put(`/courses/${courseId}/reorder-chapters`, { chapterIds });
      toast.success('Chapter order updated');
    } catch (err) {
      toast.error('Failed to update chapter order');
      await fetchChapters();
    } finally {
      setReordering(false);
    }
  };

  const handleUpdate = async (id) => {
    const chapter = chapters.find(ch => ch._id === id);
    
    // Set uploading state for this chapter
    setChapters(prev => prev.map(ch => 
      ch._id === id ? { ...ch, isUploading: true, uploadProgress: 0 } : ch
    ));

    const formData = new FormData();
    formData.append('title', chapter.title);
    formData.append('description', chapter.description);
    if (chapter.newFile) formData.append(chapter.type, chapter.newFile);
    if (chapter.type === 'quiz' && chapter.quiz) formData.append('quiz', JSON.stringify(chapter.quiz));

    try {
      await api.put(`/courses/${courseId}/chapters/${chapter._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
          setChapters(prev => prev.map(ch => 
            ch._id === id ? { ...ch, uploadProgress: percent } : ch
          ));
        },
      });
      toast.success('Chapter updated successfully!');
      navigate(`/edit-success/${courseId}`);
    } catch (err) {
      toast.error('Update failed');
      // Reset upload state on error
      setChapters(prev => prev.map(ch => 
        ch._id === id ? { ...ch, isUploading: false, uploadProgress: 0 } : ch
      ));
    }
  };
  
  const handleAddNewChapter = () => {
    setIsAddingNew(true);
    setSelectedChapterId(null);
  }
  
  const handleCreateChapter = async () => {
    if (!newChapter.title || !newChapter.description) {
      return toast.error('Title and description are required.');
    }
    if (newChapter.type !== 'quiz' && !newChapter.file) {
      return toast.error('A file is required for this chapter type.');
    }
    if (newChapter.type === 'quiz' && (!newChapter.quiz.title || newChapter.quiz.questions.length === 0)) {
      return toast.error('Quiz title and at least one question are required.');
    }

    // Set uploading state for new chapter
    setIsAddingNew(false);
    const tempId = 'new-chapter-' + Date.now();
    setChapters(prev => [...prev, {
      _id: tempId,
      title: newChapter.title,
      description: newChapter.description,
      type: newChapter.type,
      isUploading: true,
      uploadProgress: 0,
      isNew: true
    }]);

    const formData = new FormData();
    formData.append('title', newChapter.title);
    formData.append('description', newChapter.description);
    formData.append('type', newChapter.type);

    if (newChapter.type === 'quiz') {
      formData.append('quiz', JSON.stringify(newChapter.quiz));
    } else {
      formData.append(newChapter.type, newChapter.file);
    }

    try {
      await api.post(`/courses/${courseId}/chapters`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
          setChapters(prev => prev.map(ch => 
            ch._id === tempId ? { ...ch, uploadProgress: percent } : ch
          ));
        },
      });
      toast.success('New chapter added successfully!');
      navigate(`/edit-success/${courseId}`);
    } catch (err) {
      toast.error('Failed to create chapter.');
      // Remove the temporary chapter on error
      setChapters(prev => prev.filter(ch => ch._id !== tempId));
      setIsAddingNew(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This action is permanent.')) return;
    try {
      await api.delete(`/courses/${courseId}/chapters/${id}`);
      toast.success('Chapter deleted');
      if(selectedChapterId === id) setSelectedChapterId(null);
      await fetchChapters();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const renderIcon = (type) => {
    if (type === 'video') return <FiVideo className="inline mr-2" />;
    if (type === 'pdf') return <FiFileText className="inline mr-2" />;
    if (type === 'quiz') return <FiHelpCircle className="inline mr-2" />;
    return null;
  };

  const renderQuizEditor = (quiz, onChange) => {
    return (
      <div className="space-y-6">
        <Input 
          isDarkMode={isDarkMode}
          label="Quiz Title" 
          value={quiz.title} 
          onChange={(e) => onChange('title', e.target.value)} 
        />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Question
            </label>
            {quiz.questions.length < 1 && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => onChange('addQuestion')}
                className="text-sm"
              >
                <FiPlus className="w-4 h-4" /> Add Question
              </Button>
            )}
          </div>
          
          {quiz.questions.map((question, qIdx) => (
            <div key={qIdx} className={`p-6 border rounded-xl ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
              <Input 
                isDarkMode={isDarkMode}
                label={`Question ${qIdx + 1}`}
                value={question.question} 
                onChange={(e) => onChange('question', e.target.value, qIdx)} 
              />
              
              <div className="mt-6 space-y-3">
                <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Options
                </label>
                {question.options.map((option, optIdx) => (
                  <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={question.correctIndex === optIdx}
                      onChange={() => onChange('correctIndex', optIdx, qIdx)}
                      className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-blue-400 bg-gray-700 border-gray-500' : 'text-blue-600 bg-white border-gray-300'} focus:ring-blue-500`}
                    />
                    <div className="flex-1 -mb-4">
                      <Input 
                        isDarkMode={isDarkMode}
                        value={option} 
                        onChange={(e) => onChange('option', e.target.value, qIdx, optIdx)} 
                        placeholder={`Option ${optIdx + 1}`}
                      />
                    </div>
                    {question.correctIndex === optIdx && (
                      <div className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>
                        Correct
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <FiLoader className="text-4xl text-blue-500 animate-spin" />
      </div>
    );
  }

  const renderEditor = () => {
    if (isAddingNew) {
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Add New Chapter
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create engaging content for your learners
            </p>
          </div>
          
          <Input 
            isDarkMode={isDarkMode}
            label="Chapter Title" 
            value={newChapter.title} 
            onChange={e => setNewChapter({...newChapter, title: e.target.value})} 
          />
          <TextArea 
            isDarkMode={isDarkMode}
            label="Chapter Description" 
            value={newChapter.description} 
            onChange={e => setNewChapter({...newChapter, description: e.target.value})} 
          />
          
          <div className="space-y-4">
            <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Content Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['video', 'pdf', 'quiz'].map(type => (
                <button
                  key={type}
                  onClick={() => setNewChapter({...newChapter, type})}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    newChapter.type === type 
                      ? `${isDarkMode ? 'border-blue-500 bg-blue-500/20' : 'border-blue-500 bg-blue-50'}`
                      : `${isDarkMode ? 'border-gray-600 bg-gray-700 hover:border-gray-500' : 'border-gray-200 bg-white hover:border-gray-300'}`
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`text-2xl ${newChapter.type === type ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {renderIcon(type)}
                    </div>
                    <span className={`font-medium ${newChapter.type === type ? 'text-blue-600' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {newChapter.type !== 'quiz' && (
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Upload {newChapter.type.toUpperCase()} File
              </label>
              <Input 
                isDarkMode={isDarkMode}
                type="file" 
                accept={newChapter.type === 'video' ? 'video/*' : '.pdf'}
                onChange={e => setNewChapter({...newChapter, file: e.target.files[0]})} 
              />
            </div>
          )}
          
          {newChapter.type === 'quiz' && (
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
              {renderQuizEditor(newChapter.quiz, (field, value, qIdx, optIdx) => {
                const newQuiz = { ...newChapter.quiz };

                if (field === 'addQuestion') {
                  newQuiz.questions.push({ question: '', options: ['', '', '', ''], correctIndex: 0 });
                } else if (field === 'removeQuestion') {
                  newQuiz.questions.splice(value, 1);
                } else if (field === 'title') {
                  newQuiz.title = value;
                } else {
                  const questions = [...newQuiz.questions];
                  const question = { ...questions[qIdx] };
                  if (field === 'question') question.question = value;
                  else if (field === 'correctIndex') question.correctIndex = value;
                  else if (field === 'option') question.options[optIdx] = value;
                  questions[qIdx] = question;
                  newQuiz.questions = questions;
                }
                setNewChapter({ ...newChapter, quiz: newQuiz });
              })}
            </div>
          )}
          
          <div className="flex justify-end gap-4 pt-6">
            <Button variant="secondary" onClick={() => setIsAddingNew(false)}>Cancel</Button>
            <Button onClick={handleCreateChapter} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <FiCheck className="w-4 h-4 mr-2" /> Create Chapter
            </Button>
          </div>
        </div>
      );
    }

    const chapter = chapters.find(c => c._id === selectedChapterId);
    if (!chapter) {
      return (
        <div className="text-center py-16">
          <FiEye className={`mx-auto text-6xl mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Select a Chapter</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose a chapter from the list to start editing, or add a new one.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Editing: {chapter.title}
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Update your chapter content and settings
          </p>
        </div>
        
        <Input 
          label="Chapter Title" 
          value={chapter.title} 
          onChange={e => handleChapterChange(chapter._id, 'title', e.target.value)} 
        />
        <TextArea 
          label="Chapter Description" 
          value={chapter.description} 
          onChange={e => handleChapterChange(chapter._id, 'description', e.target.value)} 
        />
        
        <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-3 mb-4">
            {renderIcon(chapter.type)} 
            <span className={`font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{chapter.type}</span>
          </div>
          
          {chapter.type !== 'quiz' && (
            <div className="space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Current file: {chapter.videoUrl || chapter.pdfUrl ? (chapter.videoUrl || chapter.pdfUrl).split('/').pop() : 'None'}
              </p>
              <Input 
                label="Upload new file to replace" 
                type="file" 
                accept={chapter.type === 'video' ? 'video/*' : '.pdf'}
                onChange={e => handleFileChange(chapter._id, e.target.files[0])} 
              />
            </div>
          )}
          
          {chapter.type === 'quiz' && chapter.quiz && (
            <div className="mt-4">
              {renderQuizEditor(chapter.quiz, (field, value, qIdx, optIdx) => {
                if (field === 'addQuestion') {
                  handleQuizChange(chapter._id, null, 'addQuestion');
                } else if (field === 'removeQuestion') {
                  handleQuizChange(chapter._id, value, 'removeQuestion');
                } else {
                  handleQuizChange(chapter._id, qIdx, field, value, optIdx);
                }
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button variant="secondary" onClick={() => setSelectedChapterId(null)}>Cancel</Button>
          <Button onClick={() => handleUpdate(chapter._id)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <FiSave className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      <div className="container mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2`}>
            Manage Chapters
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Add, edit, and arrange your course content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 sticky top-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Chapters ({chapters.length})</h3>
                <Button onClick={handleAddNewChapter}>
                  <FiPlus className="w-4 h-4 mr-2" /> Add New
                </Button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                <AnimatePresence>
                  {chapters.map((ch, idx) => (
                    <motion.div
                      key={ch._id}
                      layout
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedChapterId === ch._id 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : isDarkMode 
                            ? 'border-gray-600 hover:border-gray-500' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectChapter(ch._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{ch.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleReorderChapter(ch._id, 'up') }} 
                            disabled={idx === 0 || reordering}
                            className={`p-1 rounded transition-colors ${
                              idx === 0 || reordering 
                                ? 'text-gray-400 opacity-50' 
                                : 'text-gray-400 hover:text-blue-600'
                            }`}
                          >
                            <FiChevronUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleReorderChapter(ch._id, 'down') }} 
                            disabled={idx === chapters.length - 1 || reordering}
                            className={`p-1 rounded transition-colors ${
                              idx === chapters.length - 1 || reordering 
                                ? 'text-gray-400 opacity-50' 
                                : 'text-gray-400 hover:text-blue-600'
                            }`}
                          >
                            <FiChevronDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(ch._id) }} 
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {ch.isUploading && (
                        <div className="mt-2 px-1">
                          <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5`}>
                            <div 
                              className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${ch.uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedChapterId || (isAddingNew ? 'new' : 'empty')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderEditor()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex justify-end items-center mt-8">
          <Button onClick={() => navigate(`/edit-success/${courseId}`)}>
            Finish & Save <FiArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageChapters;
