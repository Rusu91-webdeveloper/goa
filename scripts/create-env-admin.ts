import { config } from "dotenv";
// Load environment variables from .env.local
config({ path: ".env.local" });

import { MongoClient, ObjectId } from "mongodb";
import * as bcrypt from "bcrypt";

// Get admin email from environment or use default
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL?.replace("%", "") ||
  "rusu.emanuel.webdeveloper@gmail.com";
// MongoDB connection string from .env.local
const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in .env.local");
  process.exit(1);
}

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
    console.log("Admin email:", ADMIN_EMAIL);

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();

    // Admin user data
    const adminData = {
      _id: new ObjectId(),
      name: "Admin",
      email: ADMIN_EMAIL,
      password: await hashPassword("Admin@123"), // You should change this password
      role: "admin",
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if admin already exists
    const existingAdmin = await db
      .collection("users")
      .findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Create admin user
    await db.collection("users").insertOne(adminData);
    console.log("Admin user created successfully!");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password: Admin@123"); // Remember to change this in production
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
