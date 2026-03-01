module.exports = {
  secret: process.env.JWT_SECRET || "e7b9c1d2f3a4e5c6b7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", // Fallback key for dev
  jwtExpiration: 86400,           // 24 hours (in seconds)
  jwtRefreshExpiration: 864000,   // 10 days
};