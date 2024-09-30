const mongoose = require("mongoose");

// Define the schema for the patient's address
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
});

// Define the schema for the patient's medical history
const medicalHistorySchema = new mongoose.Schema({
  condition: { type: String },
  treatment: { type: String },
  doctor: { type: String },
});

// Define the schema for uploaded documents
const documentSchema = new mongoose.Schema({
  documentType: { type: String }, // No longer required
  documentUrl: { type: String }, // No longer required
  
});

// Define the main Patient schema
const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: addressSchema, required: true },
    medicalHistory: [medicalHistorySchema],
    personalInfo: {
      height: { type: String },
      weight: { type: String },
      allergies: { type: [String], default: [] }, // Changed to an array
      currentMedications: { type: [String], default: [] }, // Changed to an array
    },
    healthInfo: { type: String, default: "" },
    profileComplete: { type: Boolean, default: false },
    profileCompletionPercentage: { type: Number, default: 0 },
    documents: { type: [documentSchema], default: [] }, // Make documents an optional array
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
