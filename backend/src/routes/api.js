const express = require('express');
const router = express.Router();

const anakController = require('../controllers/anakController');
const timbangController = require('../controllers/timbangController');
const dashboardController = require('../controllers/dashboardController');
const authController = require('../controllers/authController');
const kaderController = require('../controllers/kaderController');

// 1. Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'PosyanduSmart API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 2. Auth, Posyandu & User Management
router.post('/auth/login', authController.login);
router.get('/posyandu', authController.getPosyanduList);
router.post('/posyandu', authController.createPosyandu);
router.get('/users', authController.getAllUsers);
router.post('/users', authController.createUser);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);

// 3. Data Balita (Anak)
router.get('/anak', anakController.getAllAnak);
router.get('/anak/:id', anakController.getAnakById);
router.post('/anak', anakController.createAnak);
router.put('/anak/:id', anakController.updateAnak);
router.delete('/anak/:id', anakController.deleteAnak);

// 4. Kelola Kader (Admin Puskesmas)
router.get('/kader', kaderController.getAllKader);
router.post('/kader', kaderController.createKader);
router.put('/kader/:id', kaderController.updateKader);
router.delete('/kader/:id', kaderController.deleteKader);

// 5. Penimbangan & Kalkulasi WHO & WhatsApp
router.post('/penimbangan/preview', timbangController.previewGizi);
router.post('/penimbangan', timbangController.createPenimbangan);
router.get('/penimbangan/riwayat/:anak_id', timbangController.getRiwayatAnak);
router.post('/penimbangan/:id/resend-wa', timbangController.resendWA);

// 6. Dashboard Puskesmas
router.get('/dashboard/stats', dashboardController.getStats);

module.exports = router;
