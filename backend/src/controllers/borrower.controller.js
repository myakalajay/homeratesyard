const db = require('../models');
const { Op } = require('sequelize');

// Helper to format timestamps for the UI (e.g., "2H AGO")
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'JUST NOW';
  const hours = Math.floor((new Date() - new Date(dateString)) / 3600000);
  if (hours < 1) return 'JUST NOW';
  if (hours < 24) return `${hours}H AGO`;
  return `${Math.floor(hours / 24)}D AGO`;
};

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ==========================================
    // 1. LIVE PROPERTY & EQUITY AGGREGATION
    // ==========================================
    let rawProperties = [];
    if (db.Property) {
      rawProperties = await db.Property.findAll({ 
        where: { userId }, 
        raw: true 
      }) || [];
    }

    let totalPropertyValue = 0;
    let totalPropertyDebt = 0;

    const formattedProperties = rawProperties.map(p => {
      const val = Number(p.value || p.purchasePrice || 0);
      const debt = Number(p.loanBalance || p.loanAmount || 0);
      
      totalPropertyValue += val;
      totalPropertyDebt += debt;

      return {
        id: p.id,
        type: p.propertyType || p.type || 'PROPERTY',
        name: p.name || p.address || 'Unnamed Property',
        value: val,
        loan: debt,
        track: p.trackMarket !== false, // Defaults to true
        zipCode: p.zipCode || p.zip_code || 'N/A',
        currentRate: Number(p.interestRate || 7.00)
      };
    });

    const calculatedEquity = totalPropertyValue - totalPropertyDebt;

    // ==========================================
    // 2. LIVE ACTIVE LOAN PIPELINE
    // ==========================================
    let activeApplication = null;
    let historicalTotalLoan = totalPropertyDebt; // Fallback
    let historicalCurrentLoan = totalPropertyDebt;

    if (db.Loan) {
      // Find the most recently updated active loan
      const activeLoan = await db.Loan.findOne({
        where: { 
          userId, 
          status: { [Op.in]: ['started', 'processing', 'underwriting', 'approved'] } 
        },
        order: [['updatedAt', 'DESC']],
        raw: true
      });

      if (activeLoan) {
        activeApplication = {
          id: activeLoan.loanId || activeLoan.id || `APP-${userId}`,
          type: activeLoan.loanType || activeLoan.purpose || 'Mortgage Application',
          status: activeLoan.status || 'processing',
          progress: activeLoan.progress || 25,
          actionRequired: activeLoan.actionRequired || false
        };
      }

      // Aggregate all loans for the Loan Balance Widget
      const allLoans = await db.Loan.findAll({ where: { userId }, raw: true }) || [];
      if (allLoans.length > 0) {
        historicalTotalLoan = 0;
        historicalCurrentLoan = 0;
        allLoans.forEach(l => {
          historicalTotalLoan += Number(l.originalAmount || l.amount || 0);
          historicalCurrentLoan += Number(l.currentBalance || l.balance || 0);
        });
      }
    }

    // ==========================================
    // 3. REFINANCE TRACKER LOGIC
    // ==========================================
    let refiTracker = null;
    if (formattedProperties.length > 0) {
      // Find the property with the highest interest rate in their portfolio
      const highestRateProp = [...formattedProperties].sort((a, b) => b.currentRate - a.currentRate)[0];
      
      // Note: In a fully scaled app, todayMarketRate would come from a MarketRate DB table.
      const todayMarketRate = 5.85; 

      refiTracker = {
        property: highestRateProp.name.toUpperCase(),
        currentRate: highestRateProp.currentRate,
        todayRate: todayMarketRate
      };
    } else {
      // Fallback if they have no properties
      refiTracker = { property: 'MARKET AVERAGE', currentRate: 7.25, todayRate: 5.85 };
    }

    // ==========================================
    // 4. LIVE NOTIFICATIONS
    // ==========================================
    let notifications = [];
    if (db.Notification) {
      const rawNotes = await db.Notification.findAll({
        where: { userId, isRead: false },
        order: [['createdAt', 'DESC']],
        limit: 5,
        raw: true
      }) || [];

      notifications = rawNotes.map(n => ({
        id: n.id,
        message: n.message || n.title,
        time: formatTimeAgo(n.createdAt),
        read: n.isRead || false,
        type: n.type || 'info' // 'action', 'info', 'warning'
      }));
    }

    // ==========================================
    // 5. CONSTRUCT FINAL HYDRATED PAYLOAD
    // ==========================================
    const payload = {
      equity: calculatedEquity > 0 ? calculatedEquity : 0,
      totalValue: totalPropertyValue,
      homesCount: formattedProperties.length,
      activeApplication, // Will be null if none exist, hiding the widget cleanly
      loanAmount: { 
        total: historicalTotalLoan, 
        current: historicalCurrentLoan 
      },
      refiTracker,
      properties: formattedProperties,
      notifications
    };

    res.status(200).json({
      success: true,
      data: payload
    });

  } catch (error) {
    console.error("❌ [Borrower Controller] Dashboard Aggregation Error:", error);
    next(error);
  }
};