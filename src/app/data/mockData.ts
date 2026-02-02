export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  prepTime: number;
  spiceLevel: number;
  isVeg: boolean;
  ingredients: string[];
  available: boolean;
  imageUrl: string;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'billing';
  currentOrder?: Order;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  customization?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  timestamp: Date;
  total: number;
  waiterName: string;
}

export const menuItems: MenuItem[] = [
  {
    id: 'm1',
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
    id: 'm2',
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
    id: 'm3',
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
    id: 'm4',
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
    id: 'm5',
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
    id: 'm6',
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
    id: 'm7',
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
    id: 'm8',
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
    id: 'm9',
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
    id: 'm10',
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
    id: 'm11',
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
    id: 'm12',
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

export const tables: Table[] = [
  { id: 't1', number: 1, seats: 2, status: 'available' },
  { id: 't2', number: 2, seats: 4, status: 'occupied' },
  { id: 't3', number: 3, seats: 4, status: 'occupied' },
  { id: 't4', number: 4, seats: 2, status: 'billing' },
  { id: 't5', number: 5, seats: 6, status: 'available' },
  { id: 't6', number: 6, seats: 4, status: 'reserved' },
  { id: 't7', number: 7, seats: 2, status: 'available' },
  { id: 't8', number: 8, seats: 4, status: 'occupied' },
  { id: 't9', number: 9, seats: 8, status: 'available' },
  { id: 't10', number: 10, seats: 4, status: 'available' },
];

export const activeOrders: Order[] = [
  {
    id: 'o1',
    tableId: 't2',
    items: [
      { menuItem: menuItems[0], quantity: 2, customization: 'Extra spicy' },
      { menuItem: menuItems[6], quantity: 3 },
      { menuItem: menuItems[9], quantity: 2 },
    ],
    status: 'preparing',
    timestamp: new Date(Date.now() - 15 * 60000),
    total: 1020,
    waiterName: 'Rahul',
  },
  {
    id: 'o2',
    tableId: 't3',
    items: [
      { menuItem: menuItems[1], quantity: 1 },
      { menuItem: menuItems[3], quantity: 1 },
      { menuItem: menuItems[7], quantity: 2 },
    ],
    status: 'preparing',
    timestamp: new Date(Date.now() - 10 * 60000),
    total: 730,
    waiterName: 'Priya',
  },
  {
    id: 'o3',
    tableId: 't8',
    items: [
      { menuItem: menuItems[2], quantity: 2 },
      { menuItem: menuItems[5], quantity: 4 },
    ],
    status: 'pending',
    timestamp: new Date(Date.now() - 5 * 60000),
    total: 1080,
    waiterName: 'Amit',
  },
  {
    id: 'o4',
    tableId: 't4',
    items: [
      { menuItem: menuItems[4], quantity: 1 },
      { menuItem: menuItems[10], quantity: 2 },
    ],
    status: 'ready',
    timestamp: new Date(Date.now() - 20 * 60000),
    total: 440,
    waiterName: 'Rahul',
  },
];

export const salesData = [
  { time: '9 AM', sales: 2400 },
  { time: '10 AM', sales: 3200 },
  { time: '11 AM', sales: 4100 },
  { time: '12 PM', sales: 8500 },
  { time: '1 PM', sales: 12400 },
  { time: '2 PM', sales: 9800 },
  { time: '3 PM', sales: 4200 },
  { time: '4 PM', sales: 3100 },
  { time: '5 PM', sales: 5600 },
  { time: '6 PM', sales: 7200 },
  { time: '7 PM', sales: 11800 },
  { time: '8 PM', sales: 14200 },
  { time: '9 PM', sales: 13400 },
  { time: '10 PM', sales: 8900 },
];