
const mongoose = require('mongoose');

// Create a schema for the appointment
const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  medicalHistory: { type: String, required: false },
//   city: { type: String, required: true },
  hospitalName: { type: String, required: true },
  doctorName: { type: String, required: true },
  appointmentSlot: { type: String, required: true },
  transactionId: { type: String, required: true },
  totalCharges: { type: Number, required: true },
  isPaymentComplete: { type: Boolean, default: false },
  receipt: { type: String, required: false }, // Path or URL to the PDF receipt
  qrCodeImage: { type: String, required: true }, // Path or URL to the QR code image
  createdAt: { type: Date, default: Date.now },
});

// Export the model
const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
