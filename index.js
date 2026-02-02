require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// index.js
const path = require('path');
const cors = require('cors');
app.use(cors());

// middleware
app.use(express.json());

// DB
connectDB();

// routes
app.use('/expenses', require('./routes/expenses'));

// React build を配信
app.use(express.static(path.join(__dirname, 'public/')));

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
