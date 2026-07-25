const { pool } = require('../config/database');

async function migrate() {
    try {
        console.log('Starting foreign key migration for booking_items...');

        await pool.query("ALTER TABLE booking_items MODIFY COLUMN service_id INT NULL");
        console.log('Modified service_id to be NULLABLE');

        try {
            await pool.query("ALTER TABLE booking_items DROP FOREIGN KEY booking_items_ibfk_4");
        } catch (e) {
            try { await pool.query("ALTER TABLE booking_items DROP FOREIGN KEY fk_booking_items_service"); } catch (e2) { }
        }

        try {
            await pool.query("ALTER TABLE booking_items DROP FOREIGN KEY booking_items_ibfk_5");
        } catch (e) {
            try { await pool.query("ALTER TABLE booking_items DROP FOREIGN KEY fk_booking_items_room"); } catch (e2) { }
        }

        await pool.query(`
        ALTER TABLE booking_items 
        ADD CONSTRAINT fk_booking_items_service 
        FOREIGN KEY (service_id) REFERENCES services(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
    `);
        console.log('Added SET NULL constraint for services');

        await pool.query(`
        ALTER TABLE booking_items 
        ADD CONSTRAINT fk_booking_items_room 
        FOREIGN KEY (room_id) REFERENCES rooms(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
    `);
        console.log('Added SET NULL constraint for rooms');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
