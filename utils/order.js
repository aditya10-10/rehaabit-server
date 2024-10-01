const Order = require('../models/Order.js');

const generateRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let orderId = '';
  for (let i = 0; i < 6; i++) {
    orderId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return orderId;
};

const generateOrderId = async () => {
  let orderId = generateRandomId();
  let orderExists = await Order.findOne({ orderId });
  while (orderExists) {
    orderId = generateRandomId();
    orderExists = await Order.findOne({ orderId });
  }
  return orderId;
};

module.exports = {  generateOrderId };