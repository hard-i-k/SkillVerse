import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api'; // Use the axios instance
import { FiVideo, FiFileText, FiHelpCircle, FiPlus, FiTrash2, FiMove, FiEye, FiSave, FiArrowRight, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const AddChapters = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [chapters, setChapters] = useState([
    {
      title: '',
      description: '',
      fileType: '',
      file: null,
      quiz: {
        title: '',
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correctIndex: 0,
          },
        ],
      },
      uploadProgress: 0,
      isUploading: false, // Track upload status per chapter
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false); // Global submission lock
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        title: '',
        description: '',
        fileType: '',
        file: null,
        quiz: {
          title: '',
          questions: [
            {
              question: '',
              options: ['', '', '', ''],
              correctIndex: 0,
            },
          ],
        },
        uploadProgress: 0,
        isUploading: false,
      },
    ]);
    setSelectedChapter(chapters.length);
  };

  const handleDeleteChapter = (idx) => {
    if (chapters.length === 1) {
      toast.error('You must have at least one chapter');
      return;
    }
    
    const updatedChapters = chapters.filter((_, index) => index !== idx);
    setChapters(updatedChapters);
    
    if (selectedChapter >= idx && selectedChapter > 0) {
      setSelectedChapter(selectedChapter - 1);
    } else if (selectedChapter === idx && selectedChapter === chapters.length - 1) {
      setSelectedChapter(selectedChapter - 1);
    }
    
    toast.success('Chapter deleted');
  };

  const handleMoveChapter = (idx, direction) => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === chapters.length - 1)) {
      return;
    }
    
    const updatedChapters = [...chapters];
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    [updatedChapters[idx], updatedChapters[newIdx]] = [updatedChapters[newIdx], updatedChapters[idx]];
    setChapters(updatedChapters);
    
    if (selectedChapter === idx) {
      setSelectedChapter(newIdx);
    } else if (selectedChapter === newIdx) {
      setSelectedChapter(idx);
    }
  };

  const handleChapterChange = (idx, field, value) => {
    const updated = [...chapters];
    updated[idx][field] = value;
    setChapters(updated);
  };

  const handleFileTypeChange = (idx, type) => {
    const updated = [...chapters];
    updated[idx].fileType = type;
    updated[idx].file = null;
    updated[idx].uploadProgress = 0; // Reset on type change
    if (type !== 'quiz') {
      updated[idx].quiz = { title: '', questions: [{ question: '', options: ['', '', '', ''], correctIndex: 0 }] };
    }
    setChapters(updated);
  };

  const handleFileChange = async (idx, file) => {
    const updated = [...chapters];
    updated[idx].file = file;
    updated[idx].uploadProgress = 0; // Reset progress on new file
    setChapters(updated);
  };

  const handleQuizChange = (chapIdx, field, value, qIdx = 0, optIdx = null) => {
    const updated = [...chapters];
    const question = updated[chapIdx].quiz.questions[qIdx];

    if (field === 'question') question.question = value;
    else if (field === 'option') question.options[optIdx] = value;
    else if (field === 'correctIndex') question.correctIndex = parseInt(value);
    else updated[chapIdx].quiz[field] = value;

    setChapters(updated);
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'video': return <FiVideo className="inline mr-1" />;
      case 'pdf': return <FiFileText className="inline mr-1" />;
      case 'quiz': return <FiHelpCircle className="inline mr-1" />;
      default: return null;
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      toast.error('An upload is already in progress.');
      return;
    }

    setIsSubmitting(true);

    for (let idx = 0; idx < chapters.length; idx++) {
      const chap = chapters[idx];

      setChapters(prev => {
        const updated = [...prev];
        updated[idx].isUploading = true;
        return updated;
      });

      const formData = new FormData();
      formData.append('title', chap.title);
      formData.append('description', chap.description);
      formData.append('type', chap.fileType);

      if ((chap.fileType === 'video' || chap.fileType === 'pdf') && chap.file) {
        formData.append(chap.fileType, chap.file);
        console.log('File being appended:', chap.fileType, chap.file);
      } else if (chap.fileType === 'quiz' && chap.quiz.title) {
        formData.append('quiz', JSON.stringify(chap.quiz));
      }

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      try {
        await api.post(`/courses/${courseId}/chapters`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percent = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
            setChapters(prev => {
              const updated = [...prev];
              if (updated[idx]) updated[idx].uploadProgress = percent;
              return updated;
            });
          },
        });
        toast.success(`Chapter "${chap.title}" uploaded successfully!`);
      } catch (error) {
        toast.error(`Upload failed for chapter "${chap.title}".`);
        setIsSubmitting(false);
        setChapters(prev => {
          const updated = [...prev];
          if(updated[idx]) {
            updated[idx].isUploading = false;
            updated[idx].uploadProgress = 0;
          }
          return updated;
        });
        return; 
      } finally {
        setChapters(prev => {
          const updated = [...prev];
          if(updated[idx]) updated[idx].isUploading = false;
          return updated;
        });
      }
    }

    toast.success('All chapters have been saved successfully!');
    setIsSubmitting(false);
    navigate(`/course-created-success/${courseId}`);
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2`}>
            Add Chapters
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Build your course content step by step
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-6 sticky top-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Chapters ({chapters.length})
                </h3>
                <button
                  onClick={handleAddChapter}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  <FiPlus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {chapters.map((chapter, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        onClick={() => !isSubmitting && setSelectedChapter(idx)}
                        className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                          selectedChapter === idx
                            ? `border-blue-500 ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`
                            : `border-transparent ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {idx + 1}. {chapter.title || 'New Chapter'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); handleMoveChapter(idx, 'up'); }} disabled={idx === 0 || isSubmitting} className="p-1 hover:text-blue-400 disabled:opacity-30"><FiMove className="transform -rotate-90" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleMoveChapter(idx, 'down'); }} disabled={idx === chapters.length - 1 || isSubmitting} className="p-1 hover:text-blue-400 disabled:opacity-30"><FiMove className="transform rotate-90" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteChapter(idx); }} disabled={isSubmitting} className="p-1 text-red-500 hover:text-red-400 disabled:opacity-30"><FiTrash2 /></button>
                          </div>
                        </div>
                      </div>
                      {chapter.isUploading && (
                        <div className="mt-2 px-1">
                          <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5`}>
                            <div 
                              className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${chapter.uploadProgress}%` }}
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
          
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedChapter}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Chapter {selectedChapter + 1}
                  </h3>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FiEye className="w-4 h-4" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Chapter Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter chapter title..."
                      value={chapters[selectedChapter].title}
                      onChange={(e) => handleChapterChange(selectedChapter, 'title', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Chapter Description
                    </label>
                    <textarea
                      placeholder="Describe what this chapter covers..."
                      value={chapters[selectedChapter].description}
                      onChange={(e) => handleChapterChange(selectedChapter, 'description', e.target.value)}
                      rows={4}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Content Type
                    </label>
                    <div className="flex gap-3">
                      {['video', 'pdf', 'quiz'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                            chapters[selectedChapter].fileType === type
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : isDarkMode
                                ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                                : 'border-gray-300 text-gray-600 hover:border-gray-400'
                          }`}
                          onClick={() => handleFileTypeChange(selectedChapter, type)}
                        >
                          {renderIcon(type)}
                          <span className="capitalize font-medium">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {chapters[selectedChapter].fileType && chapters[selectedChapter].fileType !== 'quiz' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Upload {chapters[selectedChapter].fileType.toUpperCase()} File
                      </label>
                      <input
                        type="file"
                        accept={chapters[selectedChapter].fileType === 'video' ? 'video/*' : '.pdf'}
                        onChange={(e) => handleFileChange(selectedChapter, e.target.files[0])}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-200' 
                            : 'border-gray-300 text-gray-900'
                        }`}
                      />
                      {chapters[selectedChapter].file && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ File selected: {chapters[selectedChapter].file.name}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {chapters[selectedChapter].fileType === 'quiz' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className={`space-y-4 p-4 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-yellow-900/20 border-yellow-700' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Quiz Title
                        </label>
                        <input
                          type="text"
                          value={chapters[selectedChapter].quiz.title}
                          onChange={(e) => handleQuizChange(selectedChapter, 'title', e.target.value)}
                          placeholder="Enter quiz title..."
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                      
                      {chapters[selectedChapter].quiz.questions.map((q, qIdx) => (
                        <div key={qIdx} className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}>
                          <div className="mb-3">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              Question {qIdx + 1}
                            </label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => handleQuizChange(selectedChapter, 'question', e.target.value, qIdx)}
                              placeholder="Enter your question..."
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              Options:
                            </label>
                            {q.options.map((opt, optIdx) => (
                              <input
                                key={optIdx}
                                type="text"
                                value={opt}
                                onChange={(e) => handleQuizChange(selectedChapter, 'option', e.target.value, qIdx, optIdx)}
                                placeholder={`Option ${optIdx + 1}`}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                          
                          <div className="mt-3">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              Correct Answer
                            </label>
                            <select
                              value={q.correctIndex}
                              onChange={(e) => handleQuizChange(selectedChapter, 'correctIndex', e.target.value, qIdx)}
                              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'border-gray-300 text-gray-900'
                              }`}
                            >
                              {q.options.map((_, i) => (
                                <option key={i} value={i}>
                                  Option {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-6 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Preview
                      </h4>
                      <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div>
                          <strong>Title:</strong> {chapters[selectedChapter].title || 'Untitled'}
                        </div>
                        <div>
                          <strong>Description:</strong> {chapters[selectedChapter].description || 'No description'}
                        </div>
                        <div>
                          <strong>Type:</strong> {chapters[selectedChapter].fileType || 'Not selected'}
                        </div>
                        {chapters[selectedChapter].fileType === 'quiz' && chapters[selectedChapter].quiz.title && (
                          <div>
                            <strong>Quiz:</strong> {chapters[selectedChapter].quiz.title}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                    <>
                        <FiLoader className="animate-spin" />
                        <span>Saving Chapters... Please Wait</span>
                    </>
                    ) : (
                    <>
                        <FiSave className="w-5 h-5" />
                        <span>Save All Chapters</span>
                    </>
                    )}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddChapters;