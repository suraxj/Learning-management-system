const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Book = require('../models/Book');

const seedData = async () => {
  try {
    // Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding default users...');
      await User.create([
        {
          name: 'Demo Admin',
          email: 'admin285@gmail.com',
          password: '12345678',
          role: 'admin'
        },
        {
          name: 'Demo User',
          email: 'user285@gmail.com',
          password: '123456',
          role: 'user'
        }
      ]);
      console.log('Default users seeded.');
    }

    // Seed Books
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log('Seeding default books...');
      await Book.create([
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '9780743273565',
          genre: 'Fiction',
          publicationYear: 1925,
          description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
          coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
          copies: 5,
          availableCopies: 5,
          borrowPricePerDay: 15,
          averageRating: 4.5
        },
        {
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          isbn: '9780446310789',
          genre: 'Classic',
          publicationYear: 1960,
          description: 'The story of Scout Finch, her brother Jem, and their father Atticus Finch, a lawyer defending a black man accused of rape in the deep South.',
          coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
          copies: 3,
          availableCopies: 3,
          borrowPricePerDay: 20,
          averageRating: 4.8
        },
        {
          title: '1984',
          author: 'George Orwell',
          isbn: '9780451524935',
          genre: 'Dystopian',
          publicationYear: 1949,
          description: 'Winston Smith wrestles with oppression in Oceania, a place where the Party scrutinizes human actions with ever-watchful Big Brother.',
          coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
          copies: 4,
          availableCopies: 4,
          borrowPricePerDay: 10,
          averageRating: 4.7
        },
        {
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          isbn: '9780345339683',
          genre: 'Fantasy',
          publicationYear: 1937,
          description: 'Bilbo Baggins, a hobbit, is whisked away into a plot to raid the treasure hoard of Smaug the Magnificent, a large and very dangerous dragon.',
          coverImage: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&q=80&w=400',
          copies: 6,
          availableCopies: 6,
          borrowPricePerDay: 25,
          averageRating: 4.9
        }
      ]);
      console.log('Default books seeded.');
    }
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      console.log('MongoDB connected');
    } catch (atlasError) {
      console.warn('MongoDB Atlas connection failed. Starting local MongoMemoryServer...');
      const mongoServer = await MongoMemoryServer.create();
      const localUri = mongoServer.getUri();
      await mongoose.connect(localUri);
      console.log('Local MongoDB Memory Server connected');
    }
    
    // Seed initial demo data
    await seedData();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
