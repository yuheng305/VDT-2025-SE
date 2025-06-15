const amqp = require('amqplib');
const { sendEmail } = require('./emailService');

// Lưu cấu hình theo projectId
const configMap = new Map();
// Lưu thời gian gửi cuối cùng của mỗi project
const lastSentMap = new Map();

async function consumeLateTasks() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'late-tasks';
    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}`);

    channel.consume(queue, async (msg) => {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log('Received late-tasks message:', data);

        const projectId = data.projectId;
        const projectKey = `project:${projectId}`;
        const config = configMap.get(projectKey);

        console.log(`Config for projectId ${projectId}:`, config);
        if (!config || !config.sendAlert) {
          console.log(`Alert disabled for projectId ${projectId}, skipping email`);
          channel.ack(msg);
          return;
        }

        // Tính thời gian trì hoãn dựa trên frequency
        let delayMs;
        switch (config.frequency) {
          case 'hourly': delayMs = 60 * 60 * 1000; break; // 1 giờ
          case 'daily': delayMs = 24 * 60 * 60 * 1000; break; // 24 giờ
          case 'weekly': delayMs = 7 * 24 * 60 * 60 * 1000; break; // 7 ngày
          default: delayMs = 24 * 60 * 60 * 1000; // Mặc định là daily
        }

        const lastSent = lastSentMap.get(projectKey);
        const now = Date.now();

        if (!lastSent || now - lastSent >= delayMs) {
          const tasks = data.tasks;
          if (tasks && tasks.length > 0) {
            await sendEmail(tasks, config.email, data.projectName);
            console.log(`Email sent to ${config.email} for ${tasks.length} tasks in project ${data.projectName}`);
            lastSentMap.set(projectKey, now);
          }
        } else {
          console.log(`Email for project ${data.projectName} skipped, last sent at ${new Date(lastSent).toLocaleString('en-US')}, waiting for next interval`);
        }

        channel.ack(msg);
      } catch (error) {
        console.error('Error processing late-tasks message:', error.message);
        channel.nack(msg, false, true); // Requeue nếu lỗi
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error consuming late-tasks:', error.message);
    setTimeout(consumeLateTasks, 5000); // Thử lại sau 5 giây
  }
}

async function consumeConfigUpdates() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'config-updates';
    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}`);

    channel.consume(queue, (msg) => {
      try {
        const config = JSON.parse(msg.content.toString());
        console.log('Received config:', config);

        // Lưu cấu hình theo projectId
        const projectKey = `project:${config.projectId}`;
        configMap.set(projectKey, {
          email: config.email,
          frequency: config.frequency,
          sendAlert: config.sendAlert,
        });

        console.log('Updated configMap:', Array.from(configMap.entries()));
        channel.ack(msg);
      } catch (error) {
        console.error('Error processing config-updates message:', error.message);
        channel.nack(msg, false, true); // Requeue nếu lỗi
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error consuming config-updates:', error.message);
    setTimeout(consumeConfigUpdates, 5000); // Thử lại sau 5 giây
  }
}

module.exports = { consumeLateTasks, consumeConfigUpdates };
