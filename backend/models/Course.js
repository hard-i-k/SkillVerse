import mongoose from 'mongoose';

// ─── Quiz Question Schema ────────────────────────────────
const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => Array.isArray(v) && v.length === 4,
      message: 'Each question must have exactly 4 options.',
    },
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
}, { _id: false });

// ─── Quiz Schema ─────────────────────────────────────────
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: {
    type: [quizQuestionSchema],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: 'Quiz must have at least one question.',
    },
  },
}, { _id: false });

// ─── Chapter Schema ─────────────────────────────────────
const chapterSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  quiz: { type: quizSchema, default: null },
}, { timestamps: true });

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// ─── Course Schema ──────────────────────────────────────
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },

  isPaid: { type: Boolean, default: false },
  price: {
    type: Number,
    required: function () {
      return this.isPaid;
    },
    default: 0,
  },

  earnings: { type: Number, default: 0 },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  payoutDetails: {
    upiId: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
  },

  chapters: {
    type: [chapterSchema],
    default: [],
  },

  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0 },
}, { timestamps: true });

courseSchema.pre('save', function (next) {
  if (this.isModified('ratings')) {
    const totalRating = this.ratings.reduce((acc, item) => item.rating + acc, 0);
    this.averageRating = this.ratings.length > 0 ? totalRating / this.ratings.length : 0;
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
