require('dotenv').config();

// Ep Node.js dung DNS Google khi phan giai dia chi MongoDB Atlas.
// Tren mot so mang, bo phan giai DNS mac dinh cua Node bi tu choi tra cuu
// ban ghi SRV (loi "querySrv ECONNREFUSED") du trinh duyet/nslookup van vao duoc.
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const foodRoutes = require('./routes/foodRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Trang goc - gioi thieu API
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'FoodManager API - He thong quan ly mon an',
    endpoints: ['GET /health', 'GET /api/foods', 'GET /api/foods/:id', 'POST /api/foods', 'PUT /api/foods/:id', 'DELETE /api/foods/:id'],
  });
});

// GET /health - Kiem tra trang thai hoat dong cua backend
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend dang hoat dong',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API quan ly mon an
app.use('/api/foods', foodRoutes);

// Xu ly duong dan khong ton tai
app.use((req, res) => {
  res.status(404).json({ message: 'Duong dan khong ton tai' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Loi: Chua cau hinh MONGODB_URI trong file .env');
  process.exit(1);
}

// Ket noi MongoDB Atlas roi moi khoi dong server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Da ket noi MongoDB Atlas thanh cong');
    app.listen(PORT, () => {
      console.log(`Backend dang chay tai http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Ket noi MongoDB Atlas that bai:', error.message);
    process.exit(1);
  });
