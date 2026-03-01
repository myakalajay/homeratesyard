require('dotenv').config();
const path = require('path');
const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // 🟢 FIX: Imported bcrypt for the Self-Healing Seeder

// Initialize the Express app configuration
const app = require('./src/app');

// 🟢 CRITICAL: Import 'db' from models
const db = require('./src/models'); 

// Import Redis (Graceful destructuring to prevent crashes if module is missing)
let connectRedis, redisClient;
try {
  const redisConfig = require('./src/config/redis');
  connectRedis = redisConfig.connectRedis;
  redisClient = redisConfig.redisClient;
} catch (e) {
  console.warn('⚠️ [Redis] Module missing or failed to load. Running without cache.');
}

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// 📂 STATIC ASSET & FILESYSTEM INITIALIZATION
// ==========================================
// 1. Ensure Uploads Directory Exists
const avatarPath = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(avatarPath)) {
  fs.mkdirSync(avatarPath, { recursive: true });
}
app.use('/uploads/avatars', express.static(avatarPath));

// 2. Ensure Email Templates Directory & Base Files Exist
const templateDir = path.join(__dirname, 'src/templates/emails');
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
  console.log('📁 [System] Initialized email template directory.');
  
  // Auto-generate the base.html if it's completely missing
  const baseHtml = `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0A1128; padding: 20px; color: white; text-align: center;"><h2>HomeRatesYard</h2></div>
        <div style="padding: 30px; color: #334155;">{{content}}</div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">© HomeRatesYard Enterprise</div>
    </div></body></html>`;
  
  fs.writeFileSync(path.join(templateDir, 'base.html'), baseHtml);
  fs.writeFileSync(path.join(templateDir, 'welcome.html'), '<h2>Welcome {{user_name}}!</h2><p>Click <a href="{{action_url}}">here</a> to login.</p>');
  fs.writeFileSync(path.join(templateDir, 'password_reset.html'), '<h2>Password Reset</h2><p>Click <a href="{{action_url}}">here</a> to securely reset your password.</p>');
}

const startServer = async () => {
  try {
    console.log(`🚀 [Server] Initializing Platform in ${NODE_ENV.toUpperCase()} mode...`);

    // 1. Database Connection & Sync
    await db.sequelize.authenticate();
    console.log('✅ [Database] Connection verified.');
    
    // 🟢 FIX: Smart Database Sync Logic
    const shouldAlterDB = NODE_ENV === 'development' || process.env.DB_ALTER === 'true';

    if (shouldAlterDB) {
      await db.sequelize.sync({ alter: true });
      console.log(`✅ [Database] Schema synced with alter:true (Safety Overrides Active).`);
    } else {
      await db.sequelize.sync();
      console.log('✅ [Database] Production schema verified (Strict Mode).');
    }

    // ==========================================
    // ⚙️ SMART AUTO-SEEDER (Heals Legacy Passwords)
    // ==========================================
    try {
        const coreUsers = [
            { name: 'Super Admin', email: 'superadmin@homeratesyard.com', rawPassword: process.env.SUPERADMIN_PASSWORD || 'superadmin123', role: 'superadmin', isVerified: true },
            { name: 'System Admin', email: 'admin@homeratesyard.com', rawPassword: process.env.ADMIN_PASSWORD || 'admin123', role: 'admin', isVerified: true },
            { name: 'Primary Lender', email: 'lender@homeratesyard.com', rawPassword: process.env.LENDER_PASSWORD || 'lender123', role: 'lender', isVerified: true },
            { name: 'Demo Borrower', email: 'borrower@homeratesyard.com', rawPassword: process.env.BORROWER_PASSWORD || 'borrower123', role: 'borrower', isVerified: true }
        ];

        for (const userData of coreUsers) {
            // 🟢 FIX: Use unscoped() to bypass the security scope so we can read the existing password hash
            const existingUser = await db.User.unscoped().findOne({ where: { email: userData.email } });
            
            if (!existingUser) {
                const t = await db.sequelize.transaction();
                try {
                    const newUser = await db.User.create({
                      name: userData.name,
                      email: userData.email,
                      password: userData.rawPassword, // The User model hook will automatically hash this
                      role: userData.role,
                      isVerified: userData.isVerified
                    }, { transaction: t });
                    
                    if (db.Profile) await db.Profile.create({ userId: newUser.id }, { transaction: t });
                    if (db.Wallet) await db.Wallet.create({ userId: newUser.id, balance: 0.00, currency: 'USD' }, { transaction: t });
                    
                    await t.commit();
                    console.log(`🎉 [Seed] ${userData.role} created successfully: ${userData.email}`);
                } catch (seedCreateErr) {
                    await t.rollback();
                    console.error(`❌ [Seed] Failed to create ${userData.role}:`, seedCreateErr.message);
                }
            } else {
                // 🟢 The "Healing" Mechanism
                // Check if the password in the DB is a raw string instead of a valid bcrypt hash
                const isHashed = existingUser.password && (existingUser.password.startsWith('$2a$') || existingUser.password.startsWith('$2b$'));
                
                if (!isHashed) {
                    console.log(`⚠️ [Seed] Healing unhashed legacy password for: ${userData.email}`);
                    const salt = await bcrypt.genSalt(10);
                    existingUser.password = await bcrypt.hash(userData.rawPassword, salt);
                    await existingUser.save();
                    console.log(`✅ [Seed] Password secured for: ${userData.email}`);
                }
            }
        }
    } catch (seedErr) {
        console.error('⚠️ [Seed] Core account verification failed (Non-Fatal):', seedErr.message);
    }
    // ==========================================

    // 2. Redis Connection (Cache Layer)
    if (process.env.REDIS_ENABLED === 'true' && connectRedis) {
        try {
            await connectRedis();
            console.log('✅ [Redis] Cache layer online.');
        } catch (redisErr) {
            console.error('⚠️ [Redis] Optional cache layer failed to start:', redisErr.message);
        }
    }

    // 3. Start Express Server
    const server = app.listen(PORT, () => {
      console.log(`\n🟢 [HY-ENTERPRISE] HTTP Service active on port ${PORT}`);
      if (NODE_ENV !== 'development') {
        console.log(`   - Internal Routing: Active`);
      }
    });

    // ==========================================
    // 🛑 GRACEFUL SHUTDOWN & ERROR HANDLING
    // ==========================================
    
    process.on('unhandledRejection', (reason, promise) => {
        console.error('\n❌ [CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        console.error('\n❌ [FATAL] Uncaught Exception thrown:', error);
        shutdown('uncaughtException');
    });

    const shutdown = async (signal) => {
        console.log(`\n🛑 ${signal} received. Initiating safety sequence...`);
        
        const forceExit = setTimeout(() => {
            console.error('⚠️ [Server] Shutdown timed out. Forced exit.');
            process.exit(1);
        }, 10000);

        server.close(async () => {
            console.log('   - HTTP Traffic halted.');
            
            try {
                await db.sequelize.close();
                console.log('   - Database connection pool drained.');
                
                if (redisClient && redisClient.isOpen) {
                    await redisClient.quit();
                    console.log('   - Redis session terminated.');
                }
            } catch (err) {
                console.error('   - Error during resource release:', err.message);
            }

            clearTimeout(forceExit);
            console.log('👋 [HY-ENTERPRISE] System offline. Exit code 0.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('\n❌ [FATAL] Startup Sequence Interrupted:');
    console.error(`   - Reason: ${err.message}`);
    process.exit(1); 
  }
};

// Execute Startup
startServer();