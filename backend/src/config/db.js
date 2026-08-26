const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'posyandu_smart',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test Connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ [Database] Berhasil terhubung ke MySQL (' + (process.env.DB_NAME || 'posyandu_smart') + ')');
    connection.release();
  } catch (error) {
    console.warn('⚠️ [Database] Belum terhubung ke MySQL: ' + error.message);
    console.warn('💡 Tips: Pastikan MySQL di XAMPP / Laragon sudah dinyalakan dan database posyandu_smart sudah dibuat.');
  }
}

testConnection();

module.exports = pool;
