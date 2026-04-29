const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    // Try connecting to the configured MongoDB URI first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.log('⚠️  Local MongoDB not available, starting in-memory database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected`);
      
      // Auto-seed demo data when using in-memory DB
      await seedDemoData();
      return true;
    } catch (memError) {
      console.error('❌ Failed to start in-memory MongoDB:', memError.message);
      return false;
    }
  }
};

const seedDemoData = async () => {
  const User = require('../models/User');
  const Service = require('../models/Service');
  const Token = require('../models/Token');

  // Check if already seeded
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return;

  console.log('🌱 Seeding demo data...');

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@smartq.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 98765 00001'
  });

  // Create users
  const user1 = await User.create({
    name: 'John Doe',
    email: 'user@smartq.com',
    password: 'user123',
    role: 'user',
    phone: '+91 98765 00002'
  });

  const user2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@smartq.com',
    password: 'user123',
    role: 'user',
    phone: '+91 98765 00003'
  });

  const user3 = await User.create({
    name: 'Ravi Kumar',
    email: 'ravi@smartq.com',
    password: 'user123',
    role: 'user',
    phone: '+91 98765 00004'
  });

  // Create services
  const services = await Service.insertMany([
    {
      name: 'General Checkup',
      description: 'Routine health checkup and consultation with general physician',
      category: 'hospital',
      icon: '🩺',
      estimatedTimePerToken: 15,
      maxTokensPerDay: 50,
      location: 'Building A, Floor 1',
      createdBy: admin._id
    },
    {
      name: 'Blood Test',
      description: 'Blood sample collection and laboratory testing',
      category: 'hospital',
      icon: '🧪',
      estimatedTimePerToken: 8,
      maxTokensPerDay: 80,
      location: 'Building A, Floor 2',
      createdBy: admin._id
    },
    {
      name: 'Account Opening',
      description: 'New savings or current account opening',
      category: 'bank',
      icon: '🏦',
      estimatedTimePerToken: 20,
      maxTokensPerDay: 40,
      location: 'Main Branch, Counter 1-3',
      createdBy: admin._id
    },
    {
      name: 'Loan Department',
      description: 'Home loan, personal loan, and vehicle loan queries',
      category: 'bank',
      icon: '💰',
      estimatedTimePerToken: 25,
      maxTokensPerDay: 30,
      location: 'Main Branch, Floor 2',
      createdBy: admin._id
    },
    {
      name: 'Admission Counter',
      description: 'New admissions and enrollment queries',
      category: 'college',
      icon: '🎓',
      estimatedTimePerToken: 12,
      maxTokensPerDay: 60,
      location: 'Admin Block, Ground Floor',
      createdBy: admin._id
    },
    {
      name: 'Passport Renewal',
      description: 'Passport renewal and new passport applications',
      category: 'government',
      icon: '📘',
      estimatedTimePerToken: 15,
      maxTokensPerDay: 100,
      location: 'Government Complex, Building B',
      createdBy: admin._id
    }
  ]);

  // Create today's tokens
  const today = new Date().toISOString().split('T')[0];
  const users = [user1, user2, user3];
  const tokens = [];

  // Tokens for General Checkup
  for (let i = 1; i <= 5; i++) {
    const status = i <= 2 ? 'completed' : i === 3 ? 'serving' : 'waiting';
    tokens.push({
      tokenNumber: i,
      displayNumber: `H-${String(i).padStart(3, '0')}`,
      service: services[0]._id,
      user: users[i % 3]._id,
      status,
      estimatedWaitTime: Math.max(0, (i - 3) * 15),
      date: today,
      calledAt: status !== 'waiting' ? new Date() : undefined,
      completedAt: status === 'completed' ? new Date() : undefined
    });
  }

  // Tokens for Blood Test
  for (let i = 1; i <= 3; i++) {
    const status = i === 1 ? 'completed' : i === 2 ? 'serving' : 'waiting';
    tokens.push({
      tokenNumber: i,
      displayNumber: `H-${String(i).padStart(3, '0')}`,
      service: services[1]._id,
      user: users[i % 3]._id,
      status,
      estimatedWaitTime: Math.max(0, (i - 2) * 8),
      date: today,
      calledAt: status !== 'waiting' ? new Date() : undefined,
      completedAt: status === 'completed' ? new Date() : undefined
    });
  }

  // Tokens for Account Opening
  for (let i = 1; i <= 4; i++) {
    const status = i === 1 ? 'completed' : i === 2 ? 'serving' : 'waiting';
    tokens.push({
      tokenNumber: i,
      displayNumber: `B-${String(i).padStart(3, '0')}`,
      service: services[2]._id,
      user: users[i % 3]._id,
      status,
      estimatedWaitTime: Math.max(0, (i - 2) * 20),
      date: today,
      calledAt: status !== 'waiting' ? new Date() : undefined,
      completedAt: status === 'completed' ? new Date() : undefined
    });
  }

  await Token.insertMany(tokens);

  // Historical tokens for analytics chart
  const historicalTokens = [];
  for (let day = 1; day <= 6; day++) {
    const d = new Date();
    d.setDate(d.getDate() - day);
    const dateStr = d.toISOString().split('T')[0];
    const count = Math.floor(Math.random() * 15) + 5;

    for (let i = 1; i <= count; i++) {
      historicalTokens.push({
        tokenNumber: i,
        displayNumber: `Q-${String(i).padStart(3, '0')}`,
        service: services[Math.floor(Math.random() * services.length)]._id,
        user: users[Math.floor(Math.random() * users.length)]._id,
        status: 'completed',
        estimatedWaitTime: 0,
        date: dateStr,
        calledAt: d,
        completedAt: d
      });
    }
  }

  await Token.insertMany(historicalTokens);

  console.log('✅ Demo data seeded successfully!');
  console.log('   Admin: admin@smartq.com / admin123');
  console.log('   User:  user@smartq.com / user123');
};

module.exports = connectDB;
