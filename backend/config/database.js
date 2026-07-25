const mysql = require('mysql2/promise');
const path = require("path");
const fs = require("fs");

// Load .env configuration
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
}

// Prepare connection pool options
const poolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 19986,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null
};

// Add CA certificate if configured
if (process.env.DB_SSL === "true") {
    const certPath = path.join(__dirname, "..", "ca.pem");
    if (fs.existsSync(certPath)) {
        poolOptions.ssl.ca = fs.readFileSync(certPath);
    }
}

// Create connection pool
const pool = mysql.createPool(poolOptions);

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Database connected successfully");
        connection.release();
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        return false;
    }
}

async function initializeTables() {
    try {
        // Tables initialization hooks if needed
    } catch (error) {
        console.error("❌ Error initializing tables:", error.message);
    }
}

module.exports = { pool, testConnection, initializeTables };