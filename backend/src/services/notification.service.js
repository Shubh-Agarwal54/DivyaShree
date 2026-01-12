const axios = require('axios');
const nodemailer = require('nodemailer');

const SMS_API_KEY = process.env.SMS_API_KEY || '62e7f2e090fe150ef8deb4466fdc81b3';
const SMS_API_BASE = 'https://sms.renflair.in';

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send OTP via SMS
const sendOTPSMS = async (phone, otp) => {
  try {
    const url = `${SMS_API_BASE}/V1.php?API=${SMS_API_KEY}&PHONE=${phone}&OTP=${otp}`;
    const response = await axios.get(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    return {
      success: false,
      message: 'Failed to send SMS OTP',
    };
  }
};

// Send order SMS to partner
const sendOrderSMS = async (phone, orderId) => {
  try {
    const url = `${SMS_API_BASE}/V4.php?API=${SMS_API_KEY}&PHONE=${phone}&OID=${orderId}`;
    const response = await axios.get(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Order SMS sending failed:', error.message);
    return {
      success: false,
      message: 'Failed to send order SMS',
    };
  }
};

// Send OTP via Email
const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
    const mailOptions = {
      from: `"DivyaShree Fashion" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your DivyaShree Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #f5f5dc; margin: 0; padding: 0; }
            .divyashree-email-container { max-width: 600px; margin: 40px auto; background: white; border: 2px solid #6B1E1E; }
            .divyashree-header { background: linear-gradient(135deg, #6B1E1E 0%, #8B2E2E 100%); padding: 30px; text-align: center; }
            .divyashree-logo { color: #D4AF37; font-size: 32px; font-weight: bold; letter-spacing: 2px; }
            .divyashree-gold-accent { color: #D4AF37; }
            .divyashree-content { padding: 40px 30px; }
            .divyashree-otp-box { background: #f5f5dc; border: 2px dashed #D4AF37; padding: 20px; text-align: center; margin: 30px 0; }
            .divyashree-otp-code { font-size: 36px; font-weight: bold; color: #6B1E1E; letter-spacing: 8px; }
            .divyashree-footer { background: #f5f5dc; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #D4AF37; }
          </style>
        </head>
        <body>
          <div class="divyashree-email-container">
            <div class="divyashree-header">
              <div class="divyashree-logo">
                <span class="divyashree-gold-accent">✦</span> DIVYASHREE <span class="divyashree-gold-accent">✦</span>
              </div>
              <p style="color: #F5F5DC; margin: 10px 0 0 0;">Ethnic Fashion for Modern Women</p>
            </div>
            
            <div class="divyashree-content">
              <h2 style="color: #6B1E1E; margin-bottom: 20px;">Hello ${name}!</h2>
              <p style="color: #333; line-height: 1.6;">Welcome to DivyaShree Fashion. To complete your account verification, please use the OTP code below:</p>
              
              <div class="divyashree-otp-box">
                <p style="margin: 0 0 10px 0; color: #6B1E1E; font-size: 14px;">Your Verification Code</p>
                <div class="divyashree-otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                If you didn't request this verification code, please ignore this email or contact our support team.
              </p>
            </div>
            
            <div class="divyashree-footer">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} DivyaShree Fashion. All rights reserved.</p>
              <p style="margin: 5px 0;">Bringing timeless elegance to your wardrobe.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'OTP sent to email',
    };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return {
      success: false,
      message: 'Failed to send email OTP',
    };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name = 'User') => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"DivyaShree Fashion" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your DivyaShree Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #f5f5dc; margin: 0; padding: 0; }
            .divyashree-email-container { max-width: 600px; margin: 40px auto; background: white; border: 2px solid #6B1E1E; }
            .divyashree-header { background: linear-gradient(135deg, #6B1E1E 0%, #8B2E2E 100%); padding: 30px; text-align: center; }
            .divyashree-logo { color: #D4AF37; font-size: 32px; font-weight: bold; letter-spacing: 2px; }
            .divyashree-gold-accent { color: #D4AF37; }
            .divyashree-content { padding: 40px 30px; }
            .divyashree-reset-button { display: inline-block; background: #6B1E1E; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .divyashree-footer { background: #f5f5dc; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #D4AF37; }
          </style>
        </head>
        <body>
          <div class="divyashree-email-container">
            <div class="divyashree-header">
              <div class="divyashree-logo">
                <span class="divyashree-gold-accent">✦</span> DIVYASHREE <span class="divyashree-gold-accent">✦</span>
              </div>
            </div>
            
            <div class="divyashree-content">
              <h2 style="color: #6B1E1E;">Password Reset Request</h2>
              <p style="color: #333; line-height: 1.6;">Hello ${name},</p>
              <p style="color: #333; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="divyashree-reset-button">Reset Password</a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
              </p>
              
              <p style="color: #999; font-size: 12px; word-break: break-all; margin-top: 20px;">
                Or copy this link: ${resetLink}
              </p>
            </div>
            
            <div class="divyashree-footer">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} DivyaShree Fashion. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'Password reset email sent',
    };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return {
      success: false,
      message: 'Failed to send password reset email',
    };
  }
};

module.exports = {
  sendOTPSMS,
  sendOTPEmail,
  sendOrderSMS,
  sendPasswordResetEmail,
};
