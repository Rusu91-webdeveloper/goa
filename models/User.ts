import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "user" | "admin" | "teacher" | "applicant";
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  // Personal Information
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  profilePicture?: string;

  // Educational & Professional Background
  educationLevel?: "HighSchool" | "Bachelor" | "Master" | "PhD" | "Other";
  germanProficiencyLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "None";
  fieldsOfInterest?: string[];
  preferredLearningMode?: "Online" | "InPerson" | "Hybrid";

  // User Activity
  lastLoginDate?: Date;
  totalLogins?: number;
  courseProgress?: Array<{
    courseId: ObjectId;
    courseName: string;
    progress: number; // Percentage
    startDate: Date;
    completionDate?: Date;
  }>;

  // Contact & Communication
  preferredContactMethod?: "Email" | "Phone" | "WhatsApp";
  marketingConsent?: boolean;

  // For Administration
  notes?: string;
  assignedTeacherId?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
