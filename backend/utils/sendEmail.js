import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // Check if SMTP settings are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('SMTP settings not configured. Email would be sent to:', options.email);
      console.log('Subject:', options.subject);
      console.log('Message:', options.message);
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Define email options
    const message = {
      from: `${process.env.FROM_NAME || 'SkillVerse'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    // Send email
    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // Log the email details for development
    console.log('Failed to send email to:', options.email);
    console.log('Subject:', options.subject);
    console.log('Message:', options.message);
    throw new Error('Email could not be sent');
  }
};

export { sendEmail }; 