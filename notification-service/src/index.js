require('dotenv').config();
const { consumeLateTasks, consumeConfigUpdates } = require('./services/rabbitmqConsumer');

consumeConfigUpdates();
consumeLateTasks();

console.log('Notification Service running...');

process.on('SIGINT', () => {
  console.log('Shutting down Notification Service...');
  process.exit(0);
});