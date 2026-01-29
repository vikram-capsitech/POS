const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../modules/restaurant/products/model');
const Table = require('../modules/restaurant/tables/model');
const Room = require('../modules/hotel/rooms/model');
const InventoryItem = require('../modules/inventory/model');
const { ROOM_STATUS } = require('@pos/shared');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_system');
    console.log('Connected to DB');

    await Product.deleteMany({});
    await Table.deleteMany({});
    await Room.deleteMany({});
    await InventoryItem.deleteMany({});

    // Seed Inventory
    const invItems = await InventoryItem.insertMany([
        { name: 'Paneer', unit: 'kg', quantity: 20, costPerUnit: 200 },
        { name: 'Butter', unit: 'kg', quantity: 10, costPerUnit: 500 },
        { name: 'Rice', unit: 'kg', quantity: 50, costPerUnit: 60 },
        { name: 'Chicken', unit: 'kg', quantity: 30, costPerUnit: 180 },
        { name: 'Flour', unit: 'kg', quantity: 40, costPerUnit: 40 },
        { name: 'Coke Bottle', unit: 'pcs', quantity: 100, costPerUnit: 25 },
    ]);
    const invMap = invItems.reduce((acc, item) => ({ ...acc, [item.name]: item._id }), {});
    console.log('Inventory Seeded');

    // Seed Products with Recipes
    const products = [
      { 
          name: 'Paneer Butter Masala', category: 'Main Course', price: 250, type: 'VEG',
          recipe: [{ ingredient: invMap['Paneer'], quantity: 0.2 }, { ingredient: invMap['Butter'], quantity: 0.05 }]
      },
      { 
          name: 'Chicken Biryani', category: 'Main Course', price: 300, type: 'NON_VEG',
          recipe: [{ ingredient: invMap['Chicken'], quantity: 0.25 }, { ingredient: invMap['Rice'], quantity: 0.2 }] 
      },
      { 
          name: 'Butter Naan', category: 'Breads', price: 40, type: 'VEG',
          recipe: [{ ingredient: invMap['Flour'], quantity: 0.1 }, { ingredient: invMap['Butter'], quantity: 0.01 }] 
      },
      { 
          name: 'Coke', category: 'Beverages', price: 40, type: 'DRINK',
          recipe: [{ ingredient: invMap['Coke Bottle'], quantity: 1 }]
      },
    ];
    await Product.insertMany(products);
    console.log('Products Seeded with Recipes');

    // Seed Tables
    const tables = Array.from({ length: 10 }, (_, i) => ({
      name: `T${i + 1}`,
      capacity: 4
    }));
    await Table.insertMany(tables);
    console.log('Tables Seeded');

    // Seed Rooms
    const rooms = [
      { number: '101', type: 'STANDARD', price: 1500, status: ROOM_STATUS.AVAILABLE },
      { number: '102', type: 'STANDARD', price: 1500, status: ROOM_STATUS.AVAILABLE },
      { number: '201', type: 'DELUXE', price: 2500, status: ROOM_STATUS.AVAILABLE },
      { number: '301', type: 'SUITE', price: 5000, status: ROOM_STATUS.AVAILABLE },
    ];
    await Room.insertMany(rooms);
    console.log('Rooms Seeded');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
