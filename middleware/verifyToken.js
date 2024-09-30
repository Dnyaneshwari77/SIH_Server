const Patient = require("../models/PatientSchema");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Example protected route
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select("-password");
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
