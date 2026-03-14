const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'profilePicture') {
            cb(null, 'uploads/profiles/');
        } else if (file.fieldname === 'document') {
            cb(null, 'uploads/documents/');
        } else if (file.fieldname === 'logo') {
            cb(null, 'uploads/logos/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png) and documents (pdf, doc, docx) are allowed'));
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    },
    fileFilter: fileFilter,
});

module.exports = upload;
