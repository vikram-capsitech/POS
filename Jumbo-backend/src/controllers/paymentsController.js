const Payments = require("../models/Payments");
const Admin = require("../models/Admin");

const createRecord = async (req, res) => {
  try {
    let { admins, status } = req.body;

    // ✅ Superadmin already verified by middleware
    const superAdmin = req.user;
    if (!superAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Single admin aaye to array bana do
    if (!Array.isArray(admins)) {
      admins = [admins];
    }

    if (!admins.length) {
      return res.status(400).json({ error: "Admins are required" });
    }

    // ✅ Admin records fetch karo (restaurantID yahin se milegi)
    const adminRecords = await Admin.find({ _id: { $in: admins } });

    if (!adminRecords.length) {
      return res.status(404).json({ error: "Admins not found" });
    }

    // ✅ Payments create
    const payments = await Promise.all(
      adminRecords.map((admin) =>
        Payments.create({
          admin: admin._id,
          restaurantID: admin.restaurantID, // 🔥 yahin se
          status,
        }),
      ),
    );

    res.status(201).json({
      success: true,
      message: "Payments created successfully",
      data: payments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getPaymentsByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (month === undefined || year === undefined) {
      return res.status(400).json({
        success: false,
        error: "Month and Year are required",
      });
    }

    // ✅ Superadmin already verified by middleware
    const superAdmin = req.user;
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const payments = await Payments.aggregate([
      {
        $match: {
          currentMonth: Number(month),
          currentYear: Number(year),
        },
      },
      {
        $lookup: {
          from: "users", // base User collection
          localField: "admin",
          foreignField: "_id",
          as: "admin",
        },
      },
      { $unwind: "$admin" },

      {
        $project: {
          _id: 1,
          adminId: "$admin._id",
          adminName: "$admin.name",
          role: "$admin.role",
          monthlyFee: "$admin.monthlyfee",
          status: 1,
          lastPaymentDate: "$date",
          month: "$currentMonth",
          year: "$currentYear",
          restaurantID: 1,
        },
      },

      { $sort: { lastPaymentDate: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    if (month === undefined || year === undefined) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required",
      });
    }
    const payment = await Payments.findOne({
      admin: id,
      currentMonth: Number(month),
      currentYear: Number(year),
      
    }).populate("admin");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for given month/year",
      });
    }

    res.status(200).json({
      success: true,
      data: [payment],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = { createRecord, getPaymentsByMonthYear, getPaymentById };
