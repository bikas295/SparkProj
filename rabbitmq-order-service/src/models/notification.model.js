const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  message: { type: String, required: true },
  offerId: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema); 