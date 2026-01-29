const Table = require('./model');

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().populate('currentOrderId');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
