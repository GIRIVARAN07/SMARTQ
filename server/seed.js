require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Token = require('./models/Token');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Token.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartq.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 00001'
    });
    console.log('👤 Admin created: admin@smartq.com / admin123');

    // Create regular users
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
    console.log('👥 Users created');

    // Create services
    const services = await Service.insertMany([
      {
        name: 'General Checkup',
        description: 'Routine health checkup and consultation with general physician',
        category: 'hospital',
        icon: '🩺',
        estimatedTimePerToken: 15,
        maxTokensPerDay: 50,
        operatingHours: { start: '09:00', end: '17:00' },
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
        operatingHours: { start: '08:00', end: '16:00' },
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
        operatingHours: { start: '10:00', end: '16:00' },
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
        operatingHours: { start: '10:00', end: '15:00' },
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
        operatingHours: { start: '09:00', end: '16:00' },
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
        operatingHours: { start: '09:30', end: '16:30' },
        location: 'Government Complex, Building B',
        createdBy: admin._id
      }
    ]);
    console.log(`🏢 ${services.length} services created`);

    // Create some tokens for today
    const today = new Date().toISOString().split('T')[0];
    const users = [user1, user2, user3];

    // Add tokens for General Checkup
    const tokens = [];
    for (let i = 1; i <= 5; i++) {
      const status = i <= 2 ? 'completed' : i === 3 ? 'serving' : 'waiting';
      tokens.push({
        tokenNumber: i,
        displayNumber: `H-${String(i).padStart(3, '0')}`,
        service: services[0]._id,
        user: users[i % 3]._id,
        status,
        estimatedWaitTime: (i - 3) * 15,
        date: today,
        calledAt: status === 'serving' || status === 'completed' ? new Date() : undefined,
        completedAt: status === 'completed' ? new Date() : undefined
      });
    }

    // Add tokens for Blood Test
    for (let i = 1; i <= 3; i++) {
      const status = i === 1 ? 'completed' : i === 2 ? 'serving' : 'waiting';
      tokens.push({
        tokenNumber: i,
        displayNumber: `H-${String(i).padStart(3, '0')}`,
        service: services[1]._id,
        user: users[i % 3]._id,
        status,
        estimatedWaitTime: (i - 2) * 8,
        date: today,
        calledAt: status !== 'waiting' ? new Date() : undefined,
        completedAt: status === 'completed' ? new Date() : undefined
      });
    }

    // Add tokens for Account Opening
    for (let i = 1; i <= 4; i++) {
      const status = i === 1 ? 'completed' : i === 2 ? 'serving' : 'waiting';
      tokens.push({
        tokenNumber: i,
        displayNumber: `B-${String(i).padStart(3, '0')}`,
        service: services[2]._id,
        user: users[i % 3]._id,
        status,
        estimatedWaitTime: (i - 2) * 20,
        date: today,
        calledAt: status !== 'waiting' ? new Date() : undefined,
        completedAt: status === 'completed' ? new Date() : undefined
      });
    }

    await Token.insertMany(tokens);
    console.log(`🎫 ${tokens.length} tokens created for today`);

    // Add some historical tokens for past days
    const historicalTokens = [];
    for (let day = 1; day <= 6; day++) {
      const d = new Date();
      d.setDate(d.getDate() - day);
      const dateStr = d.toISOString().split('T')[0];
      const count = Math.floor(Math.random() * 15) + 5;

      for (let i = 1; i <= count; i++) {
        historicalTokens.push({
          tokenNumber: i,
          displayNumber: `H-${String(i).padStart(3, '0')}`,
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
    console.log(`📊 ${historicalTokens.length} historical tokens created`);

    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║     ✅ Database Seeded Successfully!     ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  Admin: admin@smartq.com / admin123      ║');
    console.log('║  User:  user@smartq.com  / user123       ║');
    console.log('╚══════════════════════════════════════════╝');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
