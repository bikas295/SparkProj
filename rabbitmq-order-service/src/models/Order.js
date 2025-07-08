const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerName: { type: String, required: true },
  items: { type: [String], required: true },
  totalAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: "active" },
  currentLocation: {
    lat: { type: Number, default: 28.6139 }, // Default: Delhi
    lng: { type: Number, default: 77.2090 }
  }
});

module.exports = mongoose.model("Order", orderSchema);
