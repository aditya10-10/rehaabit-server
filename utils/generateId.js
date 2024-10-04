const Order = require('../models/Order.js');
const Contact = require('../models/Contact.js');
const Enquiry = require('../models/Enquiry.js');
const Counter = require('../models/Counter.js');

const generateOrderId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'order' },
    { $inc: { seq: 1 } }, 
    { new: true, upsert: true } 
  );

  const orderId = `R${String(counter.seq).padStart(6, '0')}`; 
  return orderId;
};

const generateContactId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'contact' },
    { $inc: { seq: 1 } }, 
    { new: true, upsert: true } 
  );

  const contactId = `R${String(counter.seq).padStart(6, '0')}`; 
  return contactId;
}

const generateEnquiryId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'enquiry' },
    { $inc: { seq: 1 } }, 
    { new: true, upsert: true } 
  );

  const enquiryId = `R${String(counter.seq).padStart(6, '0')}`; 
  return enquiryId;
}

module.exports = { generateOrderId,generateContactId,generateEnquiryId};
