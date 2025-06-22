import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import cloudinary from '../utils/cloudinary.js'; 
import streamifier from 'streamifier';

// 📦 Create Course
export const createCourse = async (req, res) => {
  try {
    let { title, description, category, isPaid, price } = req.body;

    // Normalize isPaid in case it's sent as string
    const paidFlag = isPaid === 'true' || isPaid === true;

    const course = await Course.create({
      title,
      description,
      category,
      isPaid: paidFlag,
      price: paidFlag ? price : 0,
      creator: req.user._id,
    });

    // Add course to user's createdCourses
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { createdCourses: course._id } });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create course', error: err.message });
  }
};


// ✏️ Update Course
export const updateCourse = async (req, res) => {
  try {
    const {
      title, description, category, level,
      isPaid, price,
      payoutDetails = {}
    } = req.body;

    const {
      bankName, accountNumber, ifscCode, upiId
    } = payoutDetails;

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const paid = isPaid || price > 0;

    if (paid) {
      const hasBank = bankName && accountNumber && ifscCode;
      const hasUPI = upiId;
      if (!(hasBank || hasUPI)) {
        return res.status(400).json({ message: 'For paid courses, provide UPI or full bank details' });
      }

      course.payoutDetails = {
        upiId,
        bankName,
        accountNumber,
        ifscCode,
      };
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.level = level || course.level;
    course.isPaid = paid;
    course.price = paid ? price : 0;

    await course.save();
    res.status(200).json({ message: 'Course updated', course });

  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// 📖 Add Chapter (with stream upload)
export const addChapter = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, type } = req.body;

    console.log('--- Add Chapter Debug ---');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('req.headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Test Cloudinary configuration
    console.log('Cloudinary config test:', {
      cloud_name: process.env.CLOUDINARY_NAME ? 'Set' : 'Not set',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });

    if (!title || !type) {
      return res.status(400).json({ message: 'Missing title or type.' });
    }
    if (!['video', 'pdf', 'quiz'].includes(type)) {
      return res.status(400).json({ message: 'Invalid content type.' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const chapter = { title, description: description || '' };

    // Upload Video
    if (type === 'video') {
      const videoFile = req.files?.video?.[0];
      if (!videoFile) {
        console.error('No video file received');
        return res.status(400).json({ message: 'Video file is required' });
      }
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'video', folder: 'SkillVerse/videos' },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          streamifier.createReadStream(videoFile.buffer).pipe(stream);
        });
        chapter.videoUrl = result.secure_url;
        chapter.publicId = result.public_id;
        console.log('Video uploaded:', result.secure_url);
      } catch (err) {
        console.error('Video upload failed:', err);
        return res.status(500).json({ message: 'Video upload failed', error: err.message });
      }
    }

    // Upload PDF
    if (type === 'pdf') {
      const pdfFile = req.files?.pdf?.[0];
      if (!pdfFile) {
        console.error('No PDF file received');
        return res.status(400).json({ message: 'PDF file is required' });
      }
      
      console.log('PDF file details:', {
        originalname: pdfFile.originalname,
        mimetype: pdfFile.mimetype,
        size: pdfFile.size,
        buffer: pdfFile.buffer ? 'Buffer exists' : 'No buffer',
        bufferLength: pdfFile.buffer ? pdfFile.buffer.length : 0
      });
      
      // Check if buffer exists and has content
      if (!pdfFile.buffer || pdfFile.buffer.length === 0) {
        console.error('PDF file buffer is empty or missing');
        return res.status(400).json({ message: 'PDF file buffer is empty or missing' });
      }
      
      try {
        const originalFilename = pdfFile.originalname.replace(/\.[^/.]+$/, '');
        console.log('Uploading PDF to Cloudinary with filename:', originalFilename);
        
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'SkillVerse/pdfs',
              public_id: originalFilename,
              filename_override: originalFilename,
              use_filename: true,
              unique_filename: false,
              type: 'upload'
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload success:', result);
                resolve(result);
              }
            }
          );
          streamifier.createReadStream(pdfFile.buffer).pipe(stream);
        });
        
        chapter.pdfUrl = result.secure_url;
        chapter.publicId = result.public_id;
        console.log('PDF uploaded successfully:', result.secure_url);
      } catch (err) {
        console.error('PDF upload failed with error:', err);
        return res.status(500).json({ message: 'PDF upload failed', error: err.message });
      }
    }

    // Attach Quiz
    if (type === 'quiz') {
      let quiz;
      try {
        quiz = JSON.parse(req.body.quiz);
      } catch {
        return res.status(400).json({ message: 'Quiz must be valid JSON.' });
      }
      if (!quiz.title || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        return res.status(400).json({ message: 'Invalid quiz structure.' });
      }
      for (const q of quiz.questions) {
        if (
          !q.question || typeof q.question !== 'string' ||
          !Array.isArray(q.options) || q.options.length !== 4 ||
          typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3
        ) {
          return res.status(400).json({ message: 'Invalid quiz question format.' });
        }
      }
      chapter.quiz = quiz;
    }

    course.chapters.push(chapter);
    await course.save();

    const addedChapter = course.chapters[course.chapters.length - 1];
    console.log('Chapter added:', addedChapter);
    res.status(201).json({ message: 'Chapter added successfully', chapterId: addedChapter._id });
  } catch (err) {
    console.error('Chapter creation failed:', err);
    res.status(500).json({ message: 'Failed to add chapter', error: err.message });
  }
};



export const updateChapter = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { title, description, removeVideo, removePdf, quiz, type } = req.body;

    console.log('--- Update Chapter Debug ---');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('req.headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized' });

    const chapter = course.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    if (title) chapter.title = title;
    if (description) chapter.description = description;

    if (removeVideo === 'true') chapter.videoUrl = '';
    if (removePdf === 'true') chapter.pdfUrl = '';

    // Upload Video
    if (req.files?.video?.[0]) {
      const videoFile = req.files.video[0];
      console.log('Video file details:', {
        originalname: videoFile.originalname,
        mimetype: videoFile.mimetype,
        size: videoFile.size,
        buffer: videoFile.buffer ? 'Buffer exists' : 'No buffer',
        bufferLength: videoFile.buffer ? videoFile.buffer.length : 0
      });
      
      if (!videoFile.buffer || videoFile.buffer.length === 0) {
        console.error('Video file buffer is empty or missing');
        return res.status(400).json({ message: 'Video file buffer is empty or missing' });
      }
      
      try {
        console.log('Uploading video to Cloudinary...');
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'video', folder: 'SkillVerse/videos' },
            (error, result) => {
              if (error) {
                console.error('Cloudinary video upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary video upload success:', result);
                resolve(result);
              }
            }
          );
          streamifier.createReadStream(videoFile.buffer).pipe(stream);
        });
        chapter.videoUrl = result.secure_url;
        chapter.publicId = result.public_id;
        console.log('Video uploaded successfully:', result.secure_url);
      } catch (err) {
        console.error('Video upload failed with error:', err);
        return res.status(500).json({ message: 'Video upload failed', error: err.message });
      }
    }

    // Upload PDF
    if (req.files?.pdf?.[0]) {
      const pdfFile = req.files.pdf[0];
      console.log('PDF file details:', {
        originalname: pdfFile.originalname,
        mimetype: pdfFile.mimetype,
        size: pdfFile.size,
        buffer: pdfFile.buffer ? 'Buffer exists' : 'No buffer',
        bufferLength: pdfFile.buffer ? pdfFile.buffer.length : 0
      });
      
      if (!pdfFile.buffer || pdfFile.buffer.length === 0) {
        console.error('PDF file buffer is empty or missing');
        return res.status(400).json({ message: 'PDF file buffer is empty or missing' });
      }
      
      try {
        const originalFilename = pdfFile.originalname.replace(/\.[^/.]+$/, '');
        console.log('Uploading PDF to Cloudinary with filename:', originalFilename);
        
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'SkillVerse/pdfs',
              public_id: originalFilename,
              filename_override: originalFilename,
              use_filename: true,
              unique_filename: false,
              type: 'upload'
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary PDF upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary PDF upload success:', result);
                resolve(result);
              }
            }
          );
          streamifier.createReadStream(pdfFile.buffer).pipe(stream);
        });
        chapter.pdfUrl = result.secure_url;
        chapter.publicId = result.public_id;
        console.log('PDF uploaded successfully:', result.secure_url);
      } catch (err) {
        console.error('PDF upload failed with error:', err);
        return res.status(500).json({ message: 'PDF upload failed', error: err.message });
      }
    }

    // Quiz
    if (quiz) {
      let parsed;
      try {
        parsed = typeof quiz === 'string' ? JSON.parse(quiz) : quiz;
      } catch {
        return res.status(400).json({ message: 'Quiz must be valid JSON.' });
      }
      const valid = parsed.title && Array.isArray(parsed.questions) &&
        parsed.questions.every(q =>
          q.question && q.options?.length === 4 && typeof q.correctIndex === 'number'
        );
      if (!valid) return res.status(400).json({ message: 'Invalid quiz format' });
      chapter.quiz = parsed;
    }

    await course.save();
    console.log('Chapter updated:', chapter);
    res.status(200).json({ message: 'Chapter updated successfully', chapter });
  } catch (err) {
    console.error('Update Chapter Error:', err);
    res.status(500).json({ message: 'Failed to update chapter', error: err.message });
  }
};

// ❌ Delete Chapter
export const deleteChapter = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;

    // Step 1: Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Step 2: Check if the user is the creator
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Step 3: Locate the chapter
    const chapterIndex = course.chapters.findIndex(
      (ch) => ch._id.toString() === chapterId
    );

    if (chapterIndex === -1) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Step 4: Remove the chapter
    course.chapters.splice(chapterIndex, 1);
    await course.save();

    return res.status(200).json({ message: 'Chapter deleted successfully' });
  } catch (err) {
    console.error('Delete Chapter Error:', err);
    return res.status(500).json({ message: 'Failed to delete chapter', error: err.message });
  }
};


// ❓ Add Quiz to Chapter
export const addQuizToChapter = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { title, questions } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const chapter = course.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    chapter.quiz = { title, questions };
    await course.save();

    res.status(200).json({ message: 'Quiz added successfully', chapter });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add quiz', error: err.message });
  }
};

// 📚 List Courses
export const listCourses = async (req, res) => {
  try {
    const { q = '' } = req.query;

    const filter = q
      ? {
          $or: [
            { title:       { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category:    { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    let courses = await Course.find(filter)
      .populate('creator', 'name email')
      .lean();

    // ✅ If user is authenticated, mark enrolled and created courses
    if (req.user && req.user._id) {
      const userId = req.user._id.toString();

      // Get all enrollments for this user
      const enrollments = await Enrollment.find({ user: userId }, 'course');
      const enrolledCourseIds = new Set(enrollments.map(e => e.course.toString()));

      courses = courses.map(course => ({
        ...course,
        isEnrolled: enrolledCourseIds.has(course._id.toString()),
        isCreator: course.creator?._id.toString() === userId
      }));
    }

    return res.status(200).json({ courses });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch courses', error: err.message });
  }
};


// 📘 Get Course by ID + check enrollment
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('creator', 'name email')
      .lean();

    if (!course) return res.status(404).json({ message: 'Course not found' });

    // ✅ Add default payoutDetails if missing
    if (!course.payoutDetails) {
      course.payoutDetails = {
        upiId: '',
        bankName: '',
        accountNumber: '',
        ifscCode: ''
      };
    }

    // ✅ Check if logged-in user is enrolled and is creator
    let isEnrolled = false;
    let isCreator = false;
    
    if (req.user && req.user._id) {
      const userId = req.user._id.toString();
      
      // Check if user is creator
      isCreator = course.creator?._id.toString() === userId;
      
      // Check if user is enrolled
      const enrolled = await Enrollment.exists({
        user: req.user._id,
        course: course._id
      });
      isEnrolled = !!enrolled;
    }

    res.status(200).json({ ...course, isEnrolled, isCreator });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course', error: err.message });
  }
};

// 📃 Get Course Content (protected)
export const getCourseContent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isCreator = course.creator.toString() === req.user._id.toString();
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (!enrollment && !isCreator) {
      return res.status(403).json({ message: 'Not enrolled in course' });
    }

    res.status(200).json({
      title: course.title,
      chapters: course.chapters,
      completedChapters: enrollment?.completedChapters || [],
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch content', error: err.message });
  }
};


// 📌 Mark Chapter Complete
export const markChapterComplete = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;

    // Check if user is enrolled
    const isEnrolled = await Enrollment.exists({ user: req.user._id, course: courseId });
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in course' });
    }

    // Update the completedChapters map on the User model
    const user = await User.findById(req.user._id);
    const completedInCourse = user.completedChapters.get(courseId) || [];
    if (!completedInCourse.includes(chapterId)) {
      completedInCourse.push(chapterId);
      user.completedChapters.set(courseId, completedInCourse);
      await user.save();
    }

    res.status(200).json({ message: 'Chapter marked as complete' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark complete', error: err.message });
  }
};

// ✅ Enroll in Course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Missing course ID' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.isPaid) {
      return res.status(400).json({ message: 'Cannot enroll in paid course via this route' });
    }

    const existing = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    const enrollment = new Enrollment({
      user: req.user._id,
      course: courseId,
      completedChapters: [],
    });

    await enrollment.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: courseId } });
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Enrollment failed', error: err.message });
  }
};


// 🎯 Filter Available Courses
export const listAvailableCourses = async (req, res) => {
  try {
    const allCourses = await Course.find();
    const userEnrollments = await Enrollment.find({ user: req.user._id }).select('course');
    const enrolledCourseIds = userEnrollments.map(e => e.course.toString());

    const availableCourses = allCourses.filter(course => !enrolledCourseIds.includes(course._id.toString()));
    res.status(200).json(availableCourses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list available courses', error: err.message });
  }
};

// 📝 Reorder Chapters
export const reorderChapters = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterIds } = req.body;

    if (!Array.isArray(chapterIds)) {
      return res.status(400).json({ message: 'Chapter IDs must be an array' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Reorder chapters based on the provided order
    const reorderedChapters = [];
    for (const chapterId of chapterIds) {
      const chapter = course.chapters.id(chapterId);
      if (chapter) {
        reorderedChapters.push(chapter);
      }
    }

    course.chapters = reorderedChapters;
    await course.save();

    res.status(200).json({ message: 'Chapters reordered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reorder chapters', error: err.message });
  }
};

// ⭐️ Rate a Course
export const rateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a rating between 1 and 5.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if user is enrolled
    const isEnrolled = await Enrollment.findOne({ user: userId, course: courseId });
    if (!isEnrolled) {
      return res.status(403).json({ message: 'You must be enrolled to rate this course.' });
    }

    // Check if user has already rated
    const existingRatingIndex = course.ratings.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      course.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      course.ratings.push({ user: userId, rating });
    }

    await course.save();
    res.status(200).json({
      message: 'Thank you for your rating!',
      averageRating: course.averageRating,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to rate course', error: err.message });
  }
};

// 🗑️ Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the creator of the course
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Only course creator can delete this course' });
    }

    // Delete all enrollments for this course
    await Enrollment.deleteMany({ course: courseId });

    // Remove course from users' enrolledCourses and createdCourses
    await User.updateMany(
      { enrolledCourses: courseId },
      { $pull: { enrolledCourses: courseId } }
    );
    await User.updateMany(
      { createdCourses: courseId },
      { $pull: { createdCourses: courseId } }
    );

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete course', error: err.message });
  }
};
