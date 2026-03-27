const nodemailer = require('nodemailer');

// Create transporter - uses env vars if available, otherwise logs to console
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

/**
 * Send OTP email to the user
 * @param {string} to - recipient email
 * @param {string} otp - the OTP code
 */
const sendOtpEmail = async (to, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"SCMS System" <no-reply@scms.com>',
    to,
    subject: 'SCMS - Your Login OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <h2 style="text-align: center; color: #4f46e5;">SCMS Login Verification</h2>
        <p style="color: #374151;">Your One-Time Password (OTP) for login is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background: #e0e7ff; padding: 12px 24px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP email sent to ${to}`);
  } else {
    // Fallback: log to console for development
    console.log('============================================');
    console.log(`[OTP EMAIL] To: ${to}`);
    console.log(`[OTP EMAIL] Code: ${otp}`);
    console.log('============================================');
  }
};

module.exports = { sendOtpEmail };
