const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send verification email
const sendVerificationEmail = async (email, verificationToken, userName) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const mailOptions = {
        from: `"Dayflow HRMS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Verify Your Dayflow Account',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Dayflow!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for signing up with Dayflow HRMS. We're excited to have you on board!</p>
            <p>Please verify your email address by clicking the button below:</p>
            <center>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </center>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
          </div>
          <div class="footer">
            <p>If you didn't create this account, please ignore this email.</p>
            <p>&copy; 2026 Dayflow HRMS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);
};

// Send leave status notification
const sendLeaveNotification = async (email, userName, leaveType, status, startDate, endDate, comments) => {
    const statusColor = status === 'Approved' ? '#10b981' : '#ef4444';
    const statusEmoji = status === 'Approved' ? '✅' : '❌';

    const mailOptions = {
        from: `"Dayflow HRMS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `${statusEmoji} Leave Request ${status}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: ${statusColor}; padding: 30px; text-align: center; color: white; }
          .content { padding: 40px 30px; }
          .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusEmoji} Leave Request ${status}</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your leave request has been <strong>${status.toLowerCase()}</strong>.</p>
            <div class="info-box">
              <div class="info-row">
                <strong>Leave Type:</strong>
                <span>${leaveType}</span>
              </div>
              <div class="info-row">
                <strong>Start Date:</strong>
                <span>${new Date(startDate).toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <strong>End Date:</strong>
                <span>${new Date(endDate).toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <strong>Status:</strong>
                <span style="color: ${statusColor}; font-weight: bold;">${status}</span>
              </div>
            </div>
            ${comments ? `<p><strong>HR Comments:</strong> ${comments}</p>` : ''}
            <p>If you have any questions, please contact your HR department.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Dayflow HRMS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `"Dayflow HRMS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Password Reset Request',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #f59e0b;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Dayflow HRMS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendVerificationEmail,
    sendLeaveNotification,
    sendPasswordResetEmail,
};
