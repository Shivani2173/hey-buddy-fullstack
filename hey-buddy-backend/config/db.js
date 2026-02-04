const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 1. Use the Cloud link from Render (process.env.MONGO_URI)
    // 2. Only use Localhost if the Cloud link is missing
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hey-buddy');

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;