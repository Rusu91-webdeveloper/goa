export interface ContactFormData {
  company: string
  lastName: string
  firstName: string
  address: string
  email: string
  phone: string
  service: string
  message: string
  createdAt: Date
}

export interface JobApplication {
  lastName: string
  firstName: string
  email: string
  phone: string
  qualifications: string[]
  message: string
  resumeUrl?: string
  createdAt: Date
}
