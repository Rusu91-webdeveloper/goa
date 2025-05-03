import clientPromise from "../lib/db";

async function testConnection() {
  try {
    console.log("Testing MongoDB connection...");
    const client = await clientPromise;
    const db = client.db();

    // Ping the database
    await db.command({ ping: 1 });
    console.log("MongoDB connection successful!");

    // List collections
    const collections = await db.listCollections().toArray();
    console.log(
      "Collections in database:",
      collections.map((c) => c.name)
    );

    // Count users
    const userCount = await db.collection("users").countDocuments();
    console.log(`Number of users in database: ${userCount}`);

    // Check for admin users
    const adminCount = await db
      .collection("users")
      .countDocuments({ role: "admin" });
    console.log(`Number of admin users: ${adminCount}`);
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
  } finally {
    process.exit(0);
  }
}

testConnection();
