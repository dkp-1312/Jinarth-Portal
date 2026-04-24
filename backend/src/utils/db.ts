import mongoose from 'mongoose';

/**
 * Database Connection Function
 * Connects to MongoDB using Mongoose
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jinarthportal';

    console.log('Connecting to MongoDB...');
    console.log(`Database URI: ${mongoURI.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide credentials in logs

    const connection = await mongoose.connect(mongoURI, {
      // Connection pooling
      maxPoolSize: 10,
      minPoolSize: 5,
      // Auto index creation
      autoIndex: true,
      // Connection timeout
      serverSelectionTimeoutMS: 5000,
      // Socket timeout
      socketTimeoutMS: 45000,
    });

    console.log('✓ MongoDB connected successfully');
    console.log(`Database: ${connection.connection.db?.databaseName}`);
    console.log(`Host: ${connection.connection.host}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected');
    });

    mongoose.connection.on('error', (error: any) => {
      console.error('✗ MongoDB connection error:', error.message);
    });

  } catch (error: any) {
    console.error('✗ MongoDB connection failed:', error.message);
    console.error('Stack:', error.stack);

    // Exit process if database connection fails
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or graceful shutdown
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error: any) {
    console.error('✗ Error disconnecting MongoDB:', error.message);
  }
};

/**
 * Get Database Status
 * Returns connection status and statistics
 */
export const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.db?.databaseName,
    models: Object.keys(mongoose.modelNames()),
  };
};

/**
 * Drop All Collections
 * WARNING: Only use in development/testing!
 */
export const dropAllCollections = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot drop collections in production!');
    }

    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    console.log('✓ All collections dropped');
  } catch (error: any) {
    console.error('✗ Error dropping collections:', error.message);
  }
};
