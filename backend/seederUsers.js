const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const seedUsers = async () => {
    try {
        await User.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin123', salt);
        const waiterPass = await bcrypt.hash('waiter123', salt);
        const kitchenPass = await bcrypt.hash('kitchen123', salt);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: adminPass,
                role: 'admin',
            },
            {
                name: 'Waiter User',
                email: 'waiter@example.com',
                password: waiterPass,
                role: 'waiter',
            },
            {
                name: 'Chef User',
                email: 'chef@example.com',
                password: kitchenPass,
                role: 'kitchen',
            },
        ];

        // Use insertMany but we must bypass pre-save hook or hash manually. 
        // With pre-save hook in User.js, just creating them normally via loop or create is safer 
        // BUT my manual hashing above + insertMany works if I disable hook or if I pass hashed directly.
        // Actually, User.create fires hooks. insertMany MIGHT not fire hooks depending on version/options.
        // EASIER: Just use create one by one or create() which fires hooks.
        // Let's usecreate without manual hash if the hook is present.
        
        // RE-READ User.js: It has pre-save hook! So I should pass PLAIN text if I use User.create or new User().
        
        await User.create([
             {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
            },
            {
                name: 'Waiter User',
                email: 'waiter@example.com',
                password: 'waiter123',
                role: 'waiter',
            },
            {
                name: 'Chef User',
                email: 'chef@example.com',
                password: 'kitchen123',
                role: 'kitchen',
            }
        ]);

        console.log('Users Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    seedUsers();
}
