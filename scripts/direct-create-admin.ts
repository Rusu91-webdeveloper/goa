import { config } from "dotenv";
config(); // Load the environment variables from .env file

import { MongoClient, ObjectId } from "mongodb";
import * as bcrypt from "bcrypt";

// MongoDB connection string - use the one from .env or a default for localhost
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/goa-website";

// Hash password function
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function createAdminUser() {
  let client: MongoClient | null = null;

  try {
    console.log("Connecting to MongoDB...");
    console.log("Using MongoDB URI:", MONGODB_URI);

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();

    // Admin user data
    const adminData = {
      _id: new ObjectId(),
      name: "Admin",
      email: "admin@goa-website.com",
      password: await hashPassword("admin123"), // You should change this password
      role: "admin",
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if admin already exists
    const existingAdmin = await db
      .collection("users")
      .findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Create admin user
    await db.collection("users").insertOne(adminData);
    console.log("Admin user created successfully!");
    console.log("Email:", adminData.email);
    console.log("Password: admin123"); // Remember to change this in production
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
    process.exit();
  }
}

createAdminUser();
