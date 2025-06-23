import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import PDFViewer from '../../components/PDFViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiArrowLeft, FiChevronDown, FiChevronRight, FiPlay, FiFileText, FiCheck, FiClock, FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FiStar
            key={index}
            size={28}
            className={`cursor-pointer transition-colors ${
              starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          />
        );
      })}
    </div>
  );
};

const ChapterAccordion = ({ chapter, index, isCompleted, isCreator, onMarkComplete, userAnswers, submittedQuiz, onOptionSelect, onSubmitQuiz, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const quiz = chapter.quiz;
  const answers = userAnswers[chapter._id] || {};
  const isSubmitted = submittedQuiz[chapter._id];
  const videoSrc = chapter.videoUrl || chapter.video || '';
  const pdfSrc = chapter.pdfUrl || chapter.pdf || '';

  const hasContent = videoSrc || pdfSrc;
  const hasQuiz = quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0;

  const [activeTab, setActiveTab] = useState(hasContent ? 'content' : 'quiz');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-xl shadow-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Chapter Header */}
      <div 
        className={`p-6 cursor-pointer transition-all duration-300 ${
          isOpen 
            ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') 
            : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : (isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700')
            }`}>
              {isCompleted ? <FiCheck /> : index + 1}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Chapter {index + 1}: {chapter.title}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {chapter.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isCompleted && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Completed
              </span>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronDown className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              {/* Content Tabs */}
              {(hasContent || hasQuiz) && (
                <div className="flex gap-2 mb-6">
                  {hasContent && (
                    <button
                      onClick={() => setActiveTab('content')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'content'
                          ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }`}
                    >
                      <FiEye className="inline mr-2" />
                      Content
                    </button>
                  )}
                  {hasQuiz && (
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'quiz'
                          ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }`}
                    >
                      <FiFileText className="inline mr-2" />
                      Quiz
                    </button>
                  )}
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && hasContent && (
                <div className="space-y-6">
                  {/* Video Content */}
                  {videoSrc && (
                    <div>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <FiPlay className="text-blue-500" />
                        Video Content
                      </h4>
                      <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
                        <video 
                          src={videoSrc} 
                          controls 
                          className="w-full h-auto max-h-[70vh] object-contain"
                          controlsList="nodownload"
                          preload="metadata"
                        />
                      </div>
                    </div>
                  )}

                  {/* PDF Content */}
                  {pdfSrc && (
                    <div>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <FiFileText className="text-green-500" />
                        PDF Content
                      </h4>
                      <div className="border rounded-xl overflow-hidden shadow-lg">
                        <PdfViewer url={pdfSrc} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Tab */}
              {activeTab === 'quiz' && hasQuiz && (
                <div className={`border rounded-xl p-6 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    📝 {quiz.title}
                  </h4>
                  {quiz.questions.map((q, qIndex) => {
                    const selected = answers[qIndex];
                    const correct = q.correctIndex;

                    return (
                      <div key={qIndex} className="mb-6">
                        <p className={`font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {qIndex + 1}. {q.question}
                        </p>
                        <div className="grid gap-2 pl-4">
                          {q.options.map((opt, optIndex) => {
                            const isSelected = selected === optIndex;
                            const isCorrect = correct === optIndex;
                            const showFeedback = isSubmitted;

                            let optionStyle = "border px-4 py-3 rounded-lg cursor-pointer transition-all duration-200";
                            if (showFeedback) {
                              if (isCorrect) {
                                optionStyle += isDarkMode ? " bg-green-900/20 border-green-500" : " bg-green-100 border-green-500";
                              } else if (isSelected) {
                                optionStyle += isDarkMode ? " bg-red-900/20 border-red-500" : " bg-red-100 border-red-500";
                              } else {
                                optionStyle += isDarkMode ? " bg-gray-700 border-gray-600" : " bg-white border-gray-300";
                              }
                            } else if (isSelected) {
                              optionStyle += isDarkMode ? " bg-blue-900/20 border-blue-500" : " bg-blue-100 border-blue-500";
                            } else {
                              optionStyle += isDarkMode ? " bg-gray-700 border-gray-600 hover:bg-gray-600" : " bg-white border-gray-300 hover:bg-gray-50";
                            }

                            return (
                              <div
                                key={optIndex}
                                className={optionStyle}
                                onClick={() => !isSubmitted && onOptionSelect(chapter._id, qIndex, optIndex)}
                              >
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                        {isSubmitted && selected !== correct && (
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Correct answer: <strong>{q.options[correct]}</strong>
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {!isSubmitted && (
                    <button
                      onClick={() => onSubmitQuiz(chapter._id)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              )}

              {/* Complete Button */}
              {!isCreator && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onMarkComplete(chapter._id)}
                    disabled={isCompleted}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [chapters, setChapters] = useState([]);
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [isCreator, setIsCreator] = useState(false);

  const fetchContent = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}/content`);
      setChapters(data.chapters || []);
      setTitle(data.title || 'Untitled Course');
      setCompleted(data.completedChapters || []);
      
      // Check if user is creator by comparing with course creator
      const courseResponse = await api.get(`/courses/${courseId}`);
      setIsCreator(courseResponse.data.isCreator);
    } catch (err) {
      console.error("❌ Failed to fetch course content", err);
      if (err.response?.status === 403) {
        toast.error("You need to enroll in this course first");
        navigate(`/courses/${courseId}`);
      } else {
        toast.error("Failed to load course content");
        navigate('/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (chapterId) => {
    try {
      await api.post(`/courses/${courseId}/chapter/${chapterId}/complete`);
      setCompleted(prev => [...prev, chapterId]);
      toast.success('Chapter marked as complete!');
    } catch (err) {
      console.error("❌ Failed to mark chapter complete", err);
      toast.error("Unable to mark chapter as complete.");
    }
  };

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  const handleOptionSelect = (chapterId, questionIndex, selectedIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        [questionIndex]: selectedIndex,
      }
    }));
  };

  const submitQuiz = (chapterId) => {
    setSubmittedQuiz(prev => ({ ...prev, [chapterId]: true }));
    toast.success('Quiz submitted!');
  };

  const handleRateCourse = async () => {
    if (userRating === 0) {
      toast.error('Please select a rating before submitting.');
      return;
    }
    try {
      await api.post(`/courses/${courseId}/rate`, { rating: userRating });
      toast.success('Rating has been saved successfully!');
      setUserRating(0); // Reset rating after successful submission
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating.');
      console.error("Failed to submit rating:", err);
    }
  };

  const progress = chapters.length ? (completed.length / chapters.length) * 100 : 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to={`/courses/${courseId}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 shadow-md'
              }`}
            >
              <FiArrowLeft />
              Back to Course
            </Link>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h1>
          </div>
          {isCreator && (
            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <span className="text-blue-600 font-semibold">Course Creator</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className={`mb-8 p-6 rounded-xl shadow-lg ${
          isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Course Progress
            </h2>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {completed.length} of {chapters.length} chapters
            </span>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 mb-2`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
            />
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {Math.round(progress)}% Complete
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading course content...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No chapters available for this course.
            </p>
            {isCreator && (
              <Link
                to={`/courses/${courseId}/manage-chapters`}
                className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Chapters
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <ChapterAccordion
                key={chapter._id}
                chapter={chapter}
                index={index}
                isCompleted={completed.includes(chapter._id)}
                isCreator={isCreator}
                onMarkComplete={markComplete}
                userAnswers={userAnswers}
                submittedQuiz={submittedQuiz}
                onOptionSelect={handleOptionSelect}
                onSubmitQuiz={submitQuiz}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}

        {/* Rating Section - Only for enrolled students, not creators */}
        {!loading && chapters.length > 0 && !isCreator && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`mt-12 p-8 border-t-2 border-dashed rounded-xl ${
              isDarkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Rate This Course
            </h3>
            <div className="flex flex-col items-center gap-4">
              <StarRating rating={userRating} setRating={setUserRating} />
              <button
                onClick={handleRateCourse}
                className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={userRating === 0}
              >
                Submit Rating
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;
