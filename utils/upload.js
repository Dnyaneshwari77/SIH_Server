const multer = require("multer");

// Configure multer storage
const storage = multer.memoryStorage(); // You can also use diskStorage if you prefer to save files on disk
const upload = multer({ storage: storage });

module.exports = upload;
