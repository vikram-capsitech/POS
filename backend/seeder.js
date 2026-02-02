const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Order = require('./models/Order');

dotenv.config();

connectDB();

const menuItems = [
  {
    name: 'Butter Chicken',
    category: 'Main Course',
    price: 420,
    prepTime: 20,
    spiceLevel: 2,
    isVeg: false,
    ingredients: ['Chicken', 'Butter', 'Tomato', 'Cream', 'Spices'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
  },
  {
    name: 'Paneer Tikka Masala',
    category: 'Main Course',
    price: 350,
    prepTime: 18,
    spiceLevel: 2,
    isVeg: true,
    ingredients: ['Paneer', 'Tomato', 'Cream', 'Capsicum', 'Spices'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
  },
  {
    name: 'Biryani',
    category: 'Main Course',
    price: 380,
    prepTime: 25,
    spiceLevel: 3,
    isVeg: false,
    ingredients: ['Chicken', 'Basmati Rice', 'Saffron', 'Yogurt', 'Spices'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
  },
  {
    name: 'Dal Makhani',
    category: 'Main Course',
    price: 280,
    prepTime: 15,
    spiceLevel: 1,
    isVeg: true,
    ingredients: ['Black Lentils', 'Butter', 'Cream', 'Tomato', 'Spices'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
  },
  {
    name: 'Tandoori Chicken',
    category: 'Starters',
    price: 320,
    prepTime: 22,
    spiceLevel: 3,
    isVeg: false,
    ingredients: ['Chicken', 'Yogurt', 'Tandoori Masala', 'Lemon'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
  },
  {
    name: 'Samosa',
    category: 'Starters',
    price: 80,
    prepTime: 10,
    spiceLevel: 2,
    isVeg: true,
    ingredients: ['Potato', 'Peas', 'Spices', 'Flour'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
  },
  {
    name: 'Garlic Naan',
    category: 'Breads',
    price: 60,
    prepTime: 8,
    spiceLevel: 0,
    isVeg: true,
    ingredients: ['Flour', 'Garlic', 'Butter', 'Coriander'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
  },
  {
    name: 'Butter Naan',
    category: 'Breads',
    price: 50,
    prepTime: 8,
    spiceLevel: 0,
    isVeg: true,
    ingredients: ['Flour', 'Butter', 'Milk'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1617054629728-f5d1af5eb93b?w=400',
  },
  {
    name: 'Gulab Jamun',
    category: 'Desserts',
    price: 120,
    prepTime: 5,
    spiceLevel: 0,
    isVeg: true,
    ingredients: ['Milk Powder', 'Sugar Syrup', 'Cardamom'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301773859-934a5c37e3e6?w=400',
  },
  {
    name: 'Masala Chai',
    category: 'Beverages',
    price: 40,
    prepTime: 5,
    spiceLevel: 1,
    isVeg: true,
    ingredients: ['Tea', 'Milk', 'Ginger', 'Cardamom', 'Sugar'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1578899952107-9d0fa5ff2b62?w=400',
  },
  {
    name: 'Fresh Lime Soda',
    category: 'Beverages',
    price: 60,
    prepTime: 3,
    spiceLevel: 0,
    isVeg: true,
    ingredients: ['Lime', 'Soda', 'Sugar', 'Mint'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
  },
  {
    name: 'Chicken Tikka',
    category: 'Starters',
    price: 340,
    prepTime: 20,
    spiceLevel: 2,
    isVeg: false,
    ingredients: ['Chicken', 'Yogurt', 'Spices', 'Lemon'],
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
  },
];

const tables = [
  { number: 1, seats: 2, status: 'available' },
  { number: 2, seats: 4, status: 'occupied' },
  { number: 3, seats: 4, status: 'occupied' },
  { number: 4, seats: 2, status: 'billing' },
  { number: 5, seats: 6, status: 'available' },
  { number: 6, seats: 4, status: 'reserved' },
  { number: 7, seats: 2, status: 'available' },
  { number: 8, seats: 4, status: 'occupied' },
  { number: 9, seats: 8, status: 'available' },
  { number: 10, seats: 4, status: 'available' },
];

const importData = async () => {
  try {
    await Order.deleteMany();
    await MenuItem.deleteMany();
    await Table.deleteMany();

    const createdMenuItems = await MenuItem.insertMany(menuItems);
    await Table.insertMany(tables);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await MenuItem.deleteMany();
    await Table.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
