export interface Setting {
  _id?: string;
  key: string;
  value: any;
  category: "general" | "contact" | "jobs" | "seo" | "social" | "other";
  label: string;
  description?: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  createdAt: Date;
  updatedAt: Date;
}
