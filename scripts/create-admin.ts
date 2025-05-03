import { hashPassword } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

async function createAdminUser() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Admin user data
    const adminData = {
      _id: new ObjectId(),
      firstName: "Admin",
      lastName: "User",
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
    process.exit();
  }
}

createAdminUser();
