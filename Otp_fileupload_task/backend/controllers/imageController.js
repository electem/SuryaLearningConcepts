const Image = require("../models/Image");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// upload image to cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mern_uploads" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// REAL upload
exports.uploadImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // upload to cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    const image = await Image.create({
      user: userId,
      imageUrl: result.secure_url,
    });

    res.json({
      success: true,
      image,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// fetch images (same as before)
exports.getUserImages = async (req, res) => {
  try {
    const images = await Image.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};