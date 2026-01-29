const Order = require('./model');
const Table = require('../tables/model');
const Product = require('../products/model');
const InventoryItem = require('../../inventory/model');

exports.createOrder = async (req, res) => {
  try {
    const { items, tableId, type } = req.body;
    
    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = totalAmount * 0.05; 
    const finalAmount = totalAmount + tax;

    // Inventory Deduction Logic
    for (const item of items) {
        const product = await Product.findById(item._id).populate('recipe.ingredient');
        if (product && product.recipe) {
            for (const recipeItem of product.recipe) {
                if (recipeItem.ingredient) {
                   const deduction = recipeItem.quantity * item.quantity;
                   await InventoryItem.findByIdAndUpdate(recipeItem.ingredient._id, {
                       $inc: { quantity: -deduction }
                   });
                }
            }
        }
    }

    const order = await Order.create({
      items,
      totalAmount,
      tax,
      finalAmount,
      tableId,
      type
    });

    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { 
        status: 'OCCUPIED',
        currentOrderId: order._id 
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('tableId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (status === 'SERVED' && order.tableId) {
         // Optionally free table here or manual close
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
