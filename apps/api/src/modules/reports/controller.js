const Order = require('../../restaurant/orders/model');
const InventoryItem = require('../../inventory/model');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Daily Sales
    const dailySales = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$finalAmount" }, count: { $sum: 1 } } }
    ]);

    // Top Selling Items
    const topItems = await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", sold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { sold: -1 } },
        { $limit: 5 }
    ]);

    // Sales Trend (Last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const salesTrend = await Order.aggregate([
        { $match: { createdAt: { $gte: last7Days } } },
        { 
            $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                sales: { $sum: "$finalAmount" } 
            } 
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        dailySales: dailySales[0] || { total: 0, count: 0 },
        topItems,
        salesTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
