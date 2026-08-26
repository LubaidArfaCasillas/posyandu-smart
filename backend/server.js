const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const apiRoutes = require('./src/routes/api');
app.use('/api', apiRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Selamat Datang di PosyanduSmart API Server',
    docs: 'Akses /api/health untuk cek status API',
    endpoints: {
      health: 'GET /api/health',
      anak: 'GET /api/anak',
      timbang: 'POST /api/penimbangan',
      preview: 'POST /api/penimbangan/preview',
      dashboard: 'GET /api/dashboard/stats',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 [PosyanduSmart Backend] Server berjalan di http://localhost:${PORT}`);
  console.log(`📡 [API Endpoint] http://localhost:${PORT}/api/health`);
});
