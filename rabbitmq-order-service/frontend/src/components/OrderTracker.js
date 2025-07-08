import React, { useState } from 'react';
import axios from 'axios';
import MapboxMap from './MapboxMap';

const OrderTracker = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    setError('');
    setOrderData(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}/track`);
      setOrderData(res.data);
    } catch (err) {
      setError('Order not found or error fetching order.');
    }
  };

  return (
    <div>
      <h2>Order Tracker</h2>
      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={e => setOrderId(e.target.value)}
      />
      <button onClick={fetchOrder}>Track Order</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {orderData && (
        <div>
          <p>Status: {orderData.status}</p>
          <MapboxMap lat={orderData.currentLocation.lat} lng={orderData.currentLocation.lng} />
        </div>
      )}
    </div>
  );
};

export default OrderTracker; 