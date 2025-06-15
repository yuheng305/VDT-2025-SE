const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(tasks, email, projectName) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('No tasks provided for email');
  }

  if (!email) {
    throw new Error(`No email provided for project ${projectName}`);
  }

  // Tạo nội dung task details
  const taskDetails = tasks
    .map(
      (task) => `
Task Name: ${task.taskName}
Assignee: ${task.employeeName || 'Unknown'}
Due Date: ${new Date(task.endDate).toLocaleDateString('en-US')}
Progress: ${task.progress}%
Status: ${task.status}
Estimated Time: ${task.estimateTime} hours
`,
    )
    .join('\n');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Task Delay Notification for ${projectName}`,
    text: `Dear Project Leader,

We would like to inform you that a task in your project "${projectName}" is delayed.

Task Details:
${taskDetails}
Please review the task and take necessary actions to get it back on track.

Best regards,
Your Project Management Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} for ${tasks.length} tasks in project ${projectName}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error.message);
    throw error;
  }
}

module.exports = { sendEmail };
