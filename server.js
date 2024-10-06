import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { 
    registerUser, authUser, getUserById, updateUser, deleteUser, 
    assignRole, listUsers 
  } from './controller/userContrller.js';

import { protect, admin } from './middleware/jwt.js';



dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());



const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
};

connectDB();

// Server setup
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.post('/register', registerUser);
app.post('/login', authUser);
app.get('/:id', protect, getUserById);
app.put('/:id', protect, updateUser);
app.delete('/:id', protect, admin, deleteUser);
app.post('/:id/role', protect, admin, assignRole);
app.get('/', protect, admin, listUsers);