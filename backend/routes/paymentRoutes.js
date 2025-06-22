import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createStripeCheckoutSession,
  verifyStripeSession
} from '../controllers/paymentController.js';

const router = express.Router();

// ✅ Create Stripe Checkout Session (POST)
router.post('/create-checkout-session', protect, createStripeCheckoutSession);

// ✅ Verify Stripe Session (GET version with courseId as query param)
router.get('/verify/:sessionId', protect, verifyStripeSession);

// 🧹 Optional legacy/fallback POST route (still supported if needed)
router.post('/verify-session/:sessionId', protect, verifyStripeSession);

export default router;
