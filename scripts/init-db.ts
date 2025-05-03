import { hashPassword } from "../lib/auth";
import clientPromise from "../lib/db";

async function initializeDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    const db = client.db();

    // Check if admin user already exists
    const adminExists = await db
      .collection("users")
      .findOne({ email: "admin@goa-erwachsenenbildung.de" });

    if (!adminExists) {
      console.log("Creating admin user...");
      const hashedPassword = await hashPassword("Admin@123");

      await db.collection("users").insertOne({
        firstName: "Admin",
        lastName: "User",
        email: "admin@goa-erwachsenenbildung.de",
        password: hashedPassword,
        role: "admin",
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists.");
    }

    // Create indexes
    console.log("Creating indexes...");

    // Users collection indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db
      .collection("users")
      .createIndex({ verificationToken: 1 }, { sparse: true });
    await db
      .collection("users")
      .createIndex({ resetPasswordToken: 1 }, { sparse: true });

    // Contacts collection indexes
    await db.collection("contacts").createIndex({ email: 1 });
    await db.collection("contacts").createIndex({ createdAt: -1 });

    // Job applications collection indexes
    await db.collection("jobApplications").createIndex({ email: 1 });
    await db.collection("jobApplications").createIndex({ createdAt: -1 });
    await db.collection("jobApplications").createIndex({ status: 1 });

    // Analytics indexes
    await db.collection("pageViews").createIndex({ timestamp: -1 });
    await db.collection("pageViews").createIndex({ path: 1 });
    await db.collection("events").createIndex({ timestamp: -1 });
    await db
      .collection("events")
      .createIndex({ eventCategory: 1, eventAction: 1 });

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    process.exit(0);
  }
}

initializeDatabase();
