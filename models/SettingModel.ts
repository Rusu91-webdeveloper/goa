import mongoose, { Schema, Model } from "mongoose";
import { Setting } from "./Setting";

// Define the schema
const settingSchema = new Schema<Setting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    category: {
      type: String,
      enum: ["general", "contact", "jobs", "seo", "social", "other"],
      default: "general",
    },
    label: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "object", "array"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Initialize the model, or get the existing one
// This is necessary because of Next.js hot reloading
let SettingModel: Model<Setting>;

try {
  SettingModel = mongoose.model<Setting>("Setting");
} catch {
  SettingModel = mongoose.model<Setting>("Setting", settingSchema);
}

export default SettingModel;
