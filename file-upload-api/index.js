const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// Ensure uploads folder exists
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Configure Multer with file type validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images and documents are allowed'));
    }
};

const upload = multer({ storage, fileFilter });

// Serve frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route (optional, index.html will be served automatically)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Single file upload
app.post('/upload', upload.single('file'), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl
        });
    } catch (error) {
        next(error);
    }
});

// Multiple file upload
app.post('/upload-multiple', upload.array('files', 5), (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const urls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
        res.status(200).json({ message: 'Files uploaded successfully', urls });
    } catch (error) {
        next(error);
    }
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
