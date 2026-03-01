require('dotenv').config(); // Load env vars
const { connectDB, sequelize } = require('./src/config/db'); // Adjust path if needed
const User = require('./src/models/User'); // Adjust path if needed

const seedAdmins = async () => {
  try {
    console.log("🌱 Starting Seeder...");
    
    // 1. Connect to DB
    await connectDB();
    await sequelize.sync({ alter: true }); // Ensure tables exist

    // 2. Define Users
    const users = [
      {
        name: "Super Administrator",
        email: "super@homerates.com",
        password: "123456", // Will be hashed automatically by your model hooks
        role: "super_admin",
        isVerified: true
      },
      {
        name: "System Admin",
        email: "admin@homerates.com",
        password: "123456", // Will be hashed automatically
        role: "admin",
        isVerified: true
      }
    ];

    // 3. Loop and Create
    for (const u of users) {
      // Check if user exists first to avoid duplicates
      const exists = await User.findOne({ where: { email: u.email } });
      
      if (exists) {
        console.log(`⚠️  User ${u.email} already exists. Updating role...`);
        exists.role = u.role;
        exists.isVerified = true;
        await exists.save();
      } else {
        await User.create(u);
        console.log(`✅ Created ${u.role}: ${u.email}`);
      }
    }

    console.log("🎉 Seeding Complete! Exiting...");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding Failed:", error.message);
    process.exit(1);
  }
};

seedAdmins();