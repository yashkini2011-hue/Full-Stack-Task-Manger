import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { connectDB } from '../config/db.js';

async function seed() {
  await connectDB();

  await User.deleteMany({ email: 'demo@example.com' });
  await Task.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await User.create({
    name: 'Demo User',
    email: 'demo@example.com',
    passwordHash,
  });

  await Task.insertMany([
    { userId: user._id, title: 'Read the README', priority: 'high' },
    { userId: user._id, title: 'Try the inline edit', priority: 'medium' },
    { userId: user._id, title: 'Mark this complete', completed: true, priority: 'low' },
  ]);

  console.log('Seeded demo@example.com / password123');
  await mongoose.disconnect();
}

seed();