const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text version of email
 * @param {String} options.html - HTML version of email
 */
exports.sendEmail = async (options) => {
  try {
    // Define email options
    const mailOptions = {
      from: `Hostel Management System <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send book overdue reminder
 * @param {Object} options - Reminder options
 * @param {Object} options.user - User object with email and name
 * @param {Object} options.book - Book object with title and id
 * @param {Date} options.dueDate - Due date of the book
 * @param {Number} options.daysOverdue - Number of days the book is overdue
 */
exports.sendBookOverdueReminder = async (options) => {
  const subject = `Reminder: Your book "${options.book.title}" is overdue`;
  
  const text = `
    Dear ${options.user.name},

    This is a reminder that the book "${options.book.title}" (ID: ${options.book.bookId}) 
    that you borrowed from the hostel library was due for return on ${options.dueDate.toDateString()}.

    The book is now ${options.daysOverdue} days overdue. Please return it as soon as possible 
    to avoid any penalties.

    If you have already returned the book, please disregard this message.

    Thank you,
    Hostel Management Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d9534f;">Book Return Reminder</h2>
      <p>Dear <strong>${options.user.name}</strong>,</p>
      
      <p>This is a reminder that the book <strong>"${options.book.title}"</strong> (ID: ${options.book.bookId}) 
      that you borrowed from the hostel library was due for return on <strong>${options.dueDate.toDateString()}</strong>.</p>
      
      <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 10px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 0;">The book is now <strong>${options.daysOverdue} days overdue</strong>. Please return it as soon as possible to avoid any penalties.</p>
      </div>
      
      <p>If you have already returned the book, please disregard this message.</p>
      
      <p>Thank you,<br>Hostel Management Team</p>
    </div>
  `;

  return await exports.sendEmail({
    to: options.user.email,
    subject,
    text,
    html
  });
};