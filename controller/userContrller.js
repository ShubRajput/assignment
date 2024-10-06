import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    firstName, lastName, email, phone, password
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// Authenticate User (Login)
export const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// Get User by ID
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// Update User
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// Delete or Disable User
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isActive = false;
    await user.save();
    res.json({ message: 'User disabled' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// Assign Role to User
export const assignRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  
  if (user) {
    user.role = role;
    await user.save();
    res.json({ message: `Role ${role} assigned to user` });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// List Users with Filters
export const listUsers = async (req, res) => {
  const { firstName, lastName, email, phone, role } = req.query;
  let filters = {};
  if (firstName) filters.firstName = new RegExp(firstName, 'i');
  if (lastName) filters.lastName = new RegExp(lastName, 'i');
  if (email) filters.email = new RegExp(email, 'i');
  if (phone) filters.phone = new RegExp(phone, 'i');
  if (role) filters.role = role;

  const users = await User.find(filters).select('-password');
  res.json(users);
};
