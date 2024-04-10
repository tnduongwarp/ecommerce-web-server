const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDirs = ['D:/DATN/Web/src/assets/img', 'D:/DATN/Seller-Web/src/assets/img'];
        uploadDirs.forEach((dir) => {
            const destinationPath = dir;
            cb(null, destinationPath);
        });
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn dung lượng tệp: 10MB
    fileFilter: function (req, file, cb) {
      // Kiểm tra định dạng của tệp
      const allowedMimes = ['image/jpeg', 'image/png'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
      }
    }
  });
  module.exports = upload