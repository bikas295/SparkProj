const amqp = require("amqplib");
const Offer = require("../models/offer.model");
const env = require("../config/env");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const mockCustomers = require("../models/mockCustomers");
const Notification = require("../models/notification.model");

// Helper: Calculate distance between two lat/lng points (Haversine formula)
function getDistanceKm(loc1, loc2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) *
      Math.cos(toRad(loc2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function consumeCancelledOrders() {
  await connectDB(env.mongodbUri);
  const connection = await amqp.connect(env.rabbitmqUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue("order.canceled", { durable: true });
  console.log("Waiting for cancelled orders in order.canceled queue");

  channel.consume("order.canceled", async (msg) => {
    if (msg !== null) {
      const order = JSON.parse(msg.content.toString());
      // Mock: Assume godown location is Delhi (28.6139, 77.2090)
      const godownLoc = { lat: 28.6139, lng: 77.2090 };
      // 1. Filter customers within 10km
      const nearby = mockCustomers.filter((c) => getDistanceKm(godownLoc, c.location) <= 10);
      // 2. Further filter: delivery in next 3 days or purchaseHabitScore >= 8
      const now = new Date();
      const eligible = nearby.filter((c) => {
        const deliveryDate = new Date(c.nextDeliveryDate);
        const daysDiff = (deliveryDate - now) / (1000 * 60 * 60 * 24);
        return daysDiff <= 3 || c.purchaseHabitScore >= 8;
      });
      // 3. Pick a customer (first eligible or fallback)
      const selected = eligible[0] || nearby[0];
      if (selected) {
        // Simulate reassignment: create an offer with discount
        const offer = new Offer({
          offerId: uuidv4(),
          orderId: order.orderId,
          customerId: selected.customerId,
          discount: Math.floor(Math.random() * 30) + 10, // 10-39% discount
          deliveryTime: `${Math.floor(Math.random() * 3) + 1} days`,
          status: "pending",
        });
        await offer.save();
        // Create notification with error logging
        try {
          const notification = new Notification({
            customerId: selected.customerId,
            message: `You have a new offer for order ${order.orderId} with ${offer.discount}% discount!`,
            offerId: offer.offerId
          });
          await notification.save();
          console.log("Notification saved for:", selected.customerId);
        } catch (err) {
          console.error("Notification save error:", err);
        }
        console.log("Order reassigned to:", selected.name, "with offer:", offer);
      } else {
        console.log("No eligible customer found for reallocation.");
      }
      channel.ack(msg);
    }
  });
}

module.exports = { consumeCancelledOrders };

if (require.main === module) {
  consumeCancelledOrders().catch((err) => {
    console.error("Consumer error:", err);
    process.exit(1);
  });
}
