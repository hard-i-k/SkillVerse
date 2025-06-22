import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedChapters: [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

export default mongoose.model('Enrollment', enrollmentSchema);
