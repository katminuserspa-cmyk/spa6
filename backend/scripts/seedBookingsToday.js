const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function seedBookings() {
  try {
    const connection = await pool.getConnection();
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Today's date: ${today}`);
    
    const [users] = await connection.query("SELECT id FROM users LIMIT 1");
    const userId = users.length > 0 ? users[0].id : null;
    
    await connection.query("DELETE FROM bookings WHERE booking_date = ?", [today]);
    console.log('🗑️ Cleared existing bookings for today');
    
    const bookingQuery = `
      INSERT INTO bookings (salon_id, customer_id, booking_type, booking_date, start_time, end_time, total_duration, status, created_by, updated_by, notes) 
      VALUES 
      (1, 1, 'calling', ?, '09:00:00', '10:00:00', 60, 'confirmed', ?, ?, 'Hair wash and hot oil massage'),
      (1, 2, 'calling', ?, '10:30:00', '11:30:00', 60, 'confirmed', ?, ?, 'Facial treatment'),
      (1, 1, 'walk_in', ?, '14:00:00', '15:30:00', 90, 'pending', ?, ?, 'Full body massage'),
      (1, 2, 'calling', ?, '16:00:00', '17:00:00', 60, 'confirmed', ?, ?, 'Manicure and pedicure'),
      (1, 3, 'walk_in', ?, '11:00:00', '12:00:00', 60, 'confirmed', ?, ?, 'Walk-in massage')
    `;
    
    const params = Array(5).fill([today, userId, userId]).flat();
    
    await connection.query(bookingQuery, params);
    console.log('✅ Bookings inserted successfully for today');
    
    const [rows] = await connection.query(`SELECT * FROM bookings WHERE booking_date = ?`, [today]);
    console.log(`✅ Found ${rows.length} bookings for today (${today})`);
    rows.forEach(row => {
      console.log(`   - ${row.start_time} to ${row.end_time}: ${row.notes}`);
    });
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding bookings:', error.message);
    process.exit(1);
  }
}

seedBookings();
