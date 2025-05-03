import mongoose, { Schema, Model } from "mongoose";
import { User } from "./User";
import bcrypt from "bcryptjs";

// Define the schema
const userSchema = new Schema<User>(
  {
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String }, // For backward compatibility
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "teacher", "applicant"],
      default: "user",
    },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Personal Information
    phoneNumber: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    zipCode: { type: String },
    profilePicture: { type: String },

    // Educational & Professional Background
    educationLevel: {
      type: String,
      enum: ["HighSchool", "Bachelor", "Master", "PhD", "Other"],
    },
    germanProficiencyLevel: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2", "None"],
    },
    fieldsOfInterest: [{ type: String }],
    preferredLearningMode: {
      type: String,
      enum: ["Online", "InPerson", "Hybrid"],
    },

    // User Activity
    lastLoginDate: { type: Date },
    totalLogins: { type: Number, default: 0 },
    courseProgress: [
      {
        courseId: { type: Schema.Types.ObjectId },
        courseName: { type: String },
        progress: { type: Number, default: 0 }, // Percentage
        startDate: { type: Date },
        completionDate: { type: Date },
      },
    ],

    // Contact & Communication
    preferredContactMethod: {
      type: String,
      enum: ["Email", "Phone", "WhatsApp"],
    },
    marketingConsent: { type: Boolean, default: false },

    // For Administration
    notes: { type: String },
    assignedTeacherId: { type: Schema.Types.ObjectId, ref: "User" },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Initialize the model, or get the existing one
// This is necessary because of Next.js hot reloading
let UserModel: Model<User>;

try {
  UserModel = mongoose.model<User>("User");
} catch {
  UserModel = mongoose.model<User>("User", userSchema);
}

export default UserModel;
