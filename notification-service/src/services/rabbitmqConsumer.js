const amqp = require('amqplib');
const { sendEmail } = require('./emailService');

// Lưu cấu hình theo leaderId
const configMap = new Map();
// Lưu thời gian gửi cuối cùng của mỗi task
const lastSentMap = new Map();

async function consumeLateTasks() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'late-tasks';
    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}`);
    channel.consume(queue, async (msg) => {
      try {
        const task = JSON.parse(msg.content.toString());
        console.log('Received task from late-tasks:', task);

        // Lấy cấu hình theo leaderId
        console.log(configMap);
        const config = configMap.get(task.leaderId);
        console.log(`Config for leaderId ${task.leaderId}:`, config);
        if (!config || !config.sendAlert) {
          console.log(`Alert disabled for leaderId ${task.leaderId}, skipping email for task ${task.taskName}`);
          channel.ack(msg);
          return;
        }

        // Tính thời gian trì hoãn dựa trên frequency
        let delayMs;
        switch (config.frequency) {
          case 'hourly': delayMs = 60 * 60 * 1000; break; // 1 giờ
          case 'daily': delayMs = 24 * 60 * 60 * 1000; break; // 24 giờ
          case 'weekly': delayMs = 7 * 24 * 60 * 60 * 1000; break; // 7 ngày
          default: delayMs = 60 * 60 * 1000; 
        }

        const lastSent = lastSentMap.get(task.taskId);
        const now = Date.now();

        if (!lastSent || now - lastSent >= delayMs) {
          // Gửi email ngay nếu chưa gửi hoặc đã qua thời gian trì hoãn
          task.leaderEmail = config.email; // Lấy email từ cấu hình
          await sendEmail(task);
          console.log(`Email sent to ${task.leaderEmail} for task ${task.taskName} immediately`);
          lastSentMap.set(task.taskId, now);
        } else {
          console.log(`Email for task ${task.taskName} skipped, last sent at ${new Date(lastSent).toLocaleString()}, waiting for next interval`);
        }

        channel.ack(msg);
      } catch (error) {
        console.error('Error processing late-tasks message:', error.message);
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error consuming late-tasks:', error.message);
  }
}

async function consumeConfigUpdates() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'config-updates';
    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}`);
    channel.consume(queue, (msg) => {
      try {
        const config = JSON.parse(msg.content.toString());
        console.log('Received config:', config);
        // Lưu cấu hình vào configMap
        configMap.set(config.leaderId, {
          email: config.email,
          frequency: config.frequency,
          sendAlert: config.sendAlert,
        });
        channel.ack(msg);
      } catch (error) {
        console.error('Error processing config-updates message:', error.message);
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error consuming config-updates:', error.message);
  }
}

module.exports = { consumeLateTasks, consumeConfigUpdates };