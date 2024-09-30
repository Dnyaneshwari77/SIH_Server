const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Add this for JWT
const bodyParser = require("body-parser");
const upload = require("./utils/upload");
const sendEmail = require("./utils/sendEmail");

const cors = require("cors");
const Patient = require("./models/PatientSchema");
const Appointment = require("./models/Appointment");

const app = express();
require("dotenv").config();

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*", // Allow requests from your frontend
    methods: ["GET", "POST", "PATCH", "DELETE"], // Specify allowed methods
    credentials: true, // Allow credentials if needed
  })
);
// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://dnyaneshwaripandhare062:Kishor$123@cluster0.x0eohlz.mongodb.net/hospital?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Signup API
app.post("/api/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    address,
    dob,
    gender,
    medicalHistory,
  } = req.body;

  try {
    // Check if user already exists
    let user = await Patient.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new patient
    const newPatient = new Patient({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      dob,
      gender,
      medicalHistory,
    });

    // Save to DB
    await newPatient.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newPatient._id, email: newPatient.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      msg: "Patient registered successfully",
      token, // Return the token in the response
      patient: {
        id: newPatient._id,
        email: newPatient.email,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await Patient.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      msg: "Login successful",
      token,
      patient: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileComplete: user.profileComplete,
        profileCompletionPercentage: user.profileCompletionPercentage,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.patch("/api/updateProfile/:id", async (req, res) => {
  const { id } = req.params;

  console.log("Body :", req.body);
  // Destructure fields from the request body
  const {
    healthInfo,
    documents,
    height,
    weight,
    allergies,
    currentMedications,
  } = req.body;

  try {
    // Find the existing patient document
    const existingPatient = await Patient.findById(id);

    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Prepare the updates object, setting only the fields that are provided
    const updates = {};

    if (height) {
      updates.personalInfo = {};

      if (height) {
        updates.personalInfo.height = height; // Update height
      }

      if (weight) {
        updates.personalInfo.weight = weight; // Update weight
      }

      if (Array.isArray(allergies)) {
        updates.personalInfo.allergies = allergies; // Update allergies array
      }

      if (Array.isArray(currentMedications)) {
        updates.personalInfo.currentMedications = currentMedications; // Update medications array
      }
    }

    if (healthInfo) {
      updates.healthInfo = healthInfo; // Only update healthInfo if provided
    }

    // Handle document URLs if provided, otherwise keep the old ones
    if (documents && Array.isArray(documents)) {
      updates.documents = documents.map((doc) => ({
        documentType: doc.documentType,
        documentUrl: doc.documentUrl,
        uploadDate: new Date(), // Set the upload date to the current date
      }));
    }

    // Set profileComplete to true
    updates.profileComplete = true;

    // Optionally, calculate profile completion percentage or update it directly
    updates.profileCompletionPercentage = 100; // Assume full completion when this route is hit

    // Update the patient document with the new data
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      updatedPatient,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

app.post("/api/send-appointment-email", sendEmail);

app.post("/api/appointments/save", async (req, res) => {
  try {
    const {
      patientName,
      age,
      gender,
      contact,
      email,
      medicalHistory,
      city,
      hospitalName,
      doctorName,
      appointmentSlot,
      transactionId,
      totalCharges,
      isPaymentComplete,
      qrCodeImage,
    } = req.body;

    // Create a new appointment document
    const newAppointment = new Appointment({
      patientName,
      age,
      gender,
      contact,
      email,
      medicalHistory,
      city,
      hospitalName,
      doctorName,
      appointmentSlot,
      transactionId,
      totalCharges,
      isPaymentComplete,
      qrCodeImage,
    });

    // Save the appointment to the database
    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      message: "Appointment saved successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    console.error("Error saving appointment:", error);
    res.status(500).json({
      message: "Error saving appointment",
      error,
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
