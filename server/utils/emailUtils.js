const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (user, password) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to EduNexus LMS - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #4f8ef7;">Welcome to EduNexus, ${user.name}!</h2>
          <p>Your account has been successfully created by an administrator.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> ${password}</p>
          </div>
          <p>Please log in and <strong>change your password</strong> immediately for security reasons.</p>
          <a href="http://localhost:5173/login" style="display: inline-block; background-color: #4f8ef7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Log in to your Dashboard</a>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = { sendWelcomeEmail };
