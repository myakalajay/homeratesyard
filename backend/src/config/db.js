const { Sequelize } = require('sequelize');

// Load environment variables with robust fallbacks
const dbName = process.env.DB_NAME || 'homerates_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost'; 
const dbPort = process.env.DB_PORT || 5432;

// Production Check
const isProduction = process.env.NODE_ENV === 'production';

/**
 * 🛠️ CONNECTION CONFIGURATION
 */
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  
  // 🌍 TIMEZONE: Force UTC to avoid local time conflicts
  timezone: '+00:00', 
  
  // 📝 LOGGING: Clean logs in production, detailed in dev
  logging: isProduction ? false : (msg) => console.log(`[SQL] ${msg}`),

  // 🏊 POOLING: Optimize for throughput
  pool: {
    max: isProduction ? 20 : 5, 
    min: 0,
    acquire: 30000, 
    idle: 10000
  },

  // 🛡️ NATIVE DRIVER OPTIONS (Critical for Render/Cloud)
  dialectOptions: {
    ...(isProduction && {
        ssl: {
            require: true,
            rejectUnauthorized: false 
        }
    }),
    keepAlive: true
  },

  // 🔄 RETRY LOGIC (Handles transient cloud network blips)
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /InvalidConnectionError/,
      /ConnectionTerminatedError/
    ],
    max: 5
  }
});

/**
 * Test and Sync Database
 * This ensures your 'Users' table is created automatically on Render.
 */
sequelize.connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`🟢 [Database] Connection verified at ${dbHost}:${dbPort}`);
    
    // 🏗️ AUTO-MIGRATION LOGIC
    // This creates/updates tables to match your models. 
    // This is what was missing and causing your 500 errors!
    if (isProduction) {
        // 'alter: true' safely updates tables without dropping data
        await sequelize.sync({ alter: true }); 
        console.log('✅ [Database] Production tables synced successfully.');
    } else {
        await sequelize.sync(); 
        console.log('✅ [Database] Development tables synced.');
    }

  } catch (error) {
    console.error('🔴 [Database] Connection or Sync Failed:', error.message);
    
    if (isProduction) {
        console.error('🔴 Critical Failure: Database unreachable. Exiting...');
        process.exit(1); 
    }
  }
};

module.exports = sequelize;