import mongoose, { Schema, Model } from "mongoose";
import { Contact } from "./Contact";

// Define the schema
const contactSchema = new Schema<Contact>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    service: { type: String },
    status: {
      type: String,
      enum: ["new", "inProgress", "resolved", "archived"],
      default: "new",
    },
    notes: [{ type: String }],
    replies: [
      {
        date: { type: Date, default: Date.now },
        message: { type: String, required: true },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Initialize the model, or get the existing one
// This is necessary because of Next.js hot reloading
let ContactModel: Model<Contact>;

try {
  ContactModel = mongoose.model<Contact>("Contact");
} catch {
  ContactModel = mongoose.model<Contact>("Contact", contactSchema);
}

export default ContactModel;
