// utils/stripe.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
   

  apiVersion: '2023-10-16',
});
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY);

export default stripe;
