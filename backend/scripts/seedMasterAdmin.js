import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

// Setup basic environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedMasterAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'masteradmin@aurora.com';
        const name = 'Master Admin';
        const password = 'Admin@1234';

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log(`Master admin already exists with email: ${email}`);
            
            // Just ensure the role is correct if it was somehow changed
            if (existingAdmin.role !== 'master_admin') {
                existingAdmin.role = 'master_admin';
                await existingAdmin.save();
                console.log('Updated existing user role to master_admin.');
            }
        } else {
            const admin = await User.create({
                name,
                email,
                password,
                role: 'master_admin'
            });
            console.log('Successfully created Master Admin!');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log('IMPORTANT: Please log in and change this password immediately.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Failed to seed master admin:', error);
        process.exit(1);
    }
};

seedMasterAdmin();
