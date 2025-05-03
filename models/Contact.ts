export interface ContactFormData {
  company: string;
  lastName: string;
  firstName: string;
  address: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: Date;
}

export interface JobApplication {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  qualifications: string[];
  message: string;
  resumeUrl?: string;
  createdAt: Date;
}

export interface Contact {
  _id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone?: string;
  message: string;
  service?: string;
  status: "new" | "inProgress" | "resolved" | "archived";
  notes?: string[];
  replies?: {
    date: Date;
    message: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
