const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  uploadImage,
  getUserImages,
} = require("../controllers/imageController");

router.post("/upload", authMiddleware, upload.single("image"), uploadImage);

router.get("/", authMiddleware, getUserImages);

module.exports = router;