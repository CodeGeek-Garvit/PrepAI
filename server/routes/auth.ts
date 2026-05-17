import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'prepai-super-secret-key';

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Pre-check for database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected', 
        details: 'The backend could not reach MongoDB. Please check your MONGODB_URI in the Secrets panel.' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({ name, email, password: hashedPassword });
    const savedUser = await user.save();

    // Generate token
    const token = jwt.sign({ id: savedUser._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      token, 
      user: { 
        id: savedUser._id.toString(), 
        name: savedUser.name, 
        email: savedUser.email 
      } 
    });
  } catch (error: any) {
    console.error('Signup Error Detailed:', error);
    let errorMessage = 'Error creating user';
    if (error.name === 'ValidationError') errorMessage = 'Validation failed';
    if (error.code === 11000) errorMessage = 'Email already in use';

    res.status(500).json({ 
      message: errorMessage, 
      details: error?.message || 'Unknown error',
      mongoStatus: mongoose.connection.readyState 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected', 
        details: 'The backend could not reach MongoDB. Please check your MONGODB_URI in the Secrets panel.' 
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router;
