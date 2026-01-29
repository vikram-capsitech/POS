const InventoryItem = require('./model');

exports.getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addStock = async (req, res) => {
  try {
    const { id, quantity, cost } = req.body;
    const item = await InventoryItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.quantity += Number(quantity);
    if (cost) item.costPerUnit = cost; // Update latest cost
    
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createItem = async (req, res) => {
    try {
        const item = await InventoryItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
