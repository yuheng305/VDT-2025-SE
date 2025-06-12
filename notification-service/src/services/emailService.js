const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(task) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: task.leaderEmail,
    subject: `Thông báo: Task "${task.taskName}" bị trễ hạn`,
    text: `Tên Task: ${task.taskName}\n` +
          `Người Thực Hiện: ${task.assignee || task.leaderName}\n` +
          `Nỗ Lực Ước Lượng (giờ): ${task.estimatedEffort || 'Chưa xác định'}\n` +
          `Thời Hạn: ${new Date(task.endDate).toLocaleDateString()}\n\n`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${task.leaderEmail} for task ${task.taskName}`);
  } catch (error) {
    console.error(`Error sending email to ${task.leaderEmail}:`, error.message);
  }
}

module.exports = { sendEmail };