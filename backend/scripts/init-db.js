const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../config/database');

async function initializeDatabase() {
  console.log('🚀 Initializing database schema and seed data...');
  const conn = await pool.getConnection();

  try {
    const sqlPath = path.join(__dirname, '../../database/all.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Master SQL file not found at ${sqlPath}`);
    }

    let sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Remove database creation and selection statements to target configured DB (defaultdb)
    sqlContent = sqlContent.replace(/DROP DATABASE IF EXISTS salon_management;/gi, '');
    sqlContent = sqlContent.replace(/CREATE DATABASE salon_management[^;]*;/gi, '');
    sqlContent = sqlContent.replace(/USE salon_management;/gi, '');
    sqlContent = sqlContent.replace(/USE k;/gi, '');

    // Clean single line comments and split into individual statements
    // We split by standard semicolon delimiters outside quotes
    const rawStatements = sqlContent.split(';');

    console.log(`Processing ${rawStatements.length} potential SQL fragments...`);

    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

    let executed = 0;
    for (let i = 0; i < rawStatements.length; i++) {
      let stmt = rawStatements[i].trim();
      // Remove leading comment blocks/lines
      stmt = stmt.replace(/^--.*$/gm, '').trim();
      if (!stmt || stmt.length < 5) continue;

      try {
        await conn.query(stmt);
        executed++;
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY') {
          continue;
        }
        console.warn(`[SQL Warning stmt ${i + 1}]: ${err.message.substring(0, 120)}`);
      }
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log(`✅ Database initialization complete. ${executed} statements executed successfully.`);

    // Verify critical tables exist
    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('Current tables in DB:', tableNames.join(', '));

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    conn.release();
    await pool.end();
  }
}

initializeDatabase();
