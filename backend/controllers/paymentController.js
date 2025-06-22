import Stripe from 'stripe';
import Course from '../models/Course.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';

// ✅ Create Stripe Checkout Session
export const createStripeCheckoutSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.creator.toString() === userId.toString()) {
      return res.status(400).json({ message: "You can't purchase your own course" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
      cancel_url: `${process.env.CLIENT_URL}/courses/${courseId}`,
      metadata: {
        // still included if you want to reference it later
        userId: userId.toString(),
        courseId: courseId.toString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe session creation error:', err.message);
    res.status(500).json({ message: 'Could not create checkout session', error: err.message });
  }
};

// ✅ Verify Stripe Session & Enroll
export const verifyStripeSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { sessionId } = req.params;
    const { courseId } = req.query;
    const userId = req.user._id;

    if (!sessionId || !courseId) {
      return res.status(400).json({ message: 'Missing session ID or course ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed yet' });
    }

    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId),
    ]);

    if (!user || !course) {
      return res.status(404).json({ message: 'User or Course not found' });
    }

    // ✅ Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ user: user._id, course: course._id });
    if (!alreadyEnrolled) {
      await Enrollment.create({ user: user._id, course: course._id });
      await User.findByIdAndUpdate(user._id, { $addToSet: { enrolledCourses: course._id } });

      // ✅ Update course earnings
      course.earnings = (course.earnings || 0) + course.price;
      await course.save();
    }

    res.status(200).json({ message: '✅ Payment verified and enrollment successful.' });
  } catch (err) {
    console.error('❌ Stripe session verification error:', err);
    return res.status(500).json({
      message: 'Could not verify payment',
      error: err.message,
    });
  }
};
