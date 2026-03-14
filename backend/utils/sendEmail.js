const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.html - HTML content (optional)
 */
const sendEmail = async (options) => {
    try {
        // Create transporter (note: it's createTransport, not createTransporter)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email options
        const mailOptions = {
            from: `"Dayflow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
