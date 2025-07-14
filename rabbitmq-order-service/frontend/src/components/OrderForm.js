import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingSpinner from './LoadingSpinner';

let createOrder;
if (process.env.NODE_ENV === 'development') {
  // Use mock API in development
  createOrder = require('../api-mock').createOrder;
} else {
  // Use real API in production
  createOrder = async (orderData) => {
    const axios = await import('axios');
    return axios.default.post('/api/orders', orderData);
  };
}

const OrderForm = () => {
  const [form, setForm] = useState({ customer: '', items: '', total: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.customer.trim()) return 'Customer name is required.';
    if (!form.items.trim()) return 'At least one item is required.';
    if (!form.total.trim() || isNaN(form.total) || Number(form.total) <= 0) return 'Total must be a positive number.';
    return '';
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        customerName: form.customer,
        items: form.items.split(',').map((item) => item.trim()).filter(Boolean),
        totalAmount: parseFloat(form.total),
      };
      await createOrder(payload);
      setSuccess('Order placed!');
      setForm({ customer: '', items: '', total: '' });
    } catch (err) {
      setError('Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: '2rem auto', boxShadow: 3 }}>
      <form onSubmit={submitOrder} autoComplete="off">
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Place a New Order
          </Typography>
          <TextField
            label="Customer Name"
            name="customer"
            value={form.customer}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Items (comma separated)"
            name="items"
            value={form.items}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Total Amount"
            name="total"
            value={form.total}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            type="number"
            inputProps={{ min: 0, step: 'any' }}
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          {success && <Typography color="primary" sx={{ mt: 1 }}>{success}</Typography>}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            Submit Order
          </Button>
        </CardActions>
        {loading && <LoadingSpinner />}
      </form>
    </Card>
  );
};

export default OrderForm; 