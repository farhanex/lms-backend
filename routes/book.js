// const express = require('express');
// const multer = require('multer');
// const { check, validationResult } = require('express-validator');
// const Book = require('../models/Book');
// const auth = require('../middleware/auth');
// const router = express.Router();
// const fs = require('fs');
// const path = require('path');
// const Issue = require('../models/IssueBook');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage: storage });

// router.get('/books', [auth('admin')], async (req, res) => {
//   try {
//     const books = await Book.find();
//     return res.json(books);
//   } catch (err) {
//     // console.error(err.message);
//     return res.status(500).send('Server error');
//   }
// });

// router.post(
//   '/addbook',
//   [auth('admin')],
//   upload.single('image'),
//   [
//     check('name', 'Book name is required').not().isEmpty(),
//     check('author', 'Book author is required').not().isEmpty(),
//     check('qty', 'Book quantity is required').isInt({ min: 1 }),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       // dlt the uploaded pic if validation fails
//       if (req.file && req.file.path) {
//         fs.unlink(path.join(__dirname, '../', req.file.path), (err) => {
//           // if (err) {
//           //   console.error('File deleted because validation failed:', err);
//           // }
//         });
//       }
//       return res.status(400).json({ msg: "Book Validation Failed" });
//     }

//     const { name, author, qty } = req.body;

//     try {
//       const existingBook = await Book.findOne({ name, author });
//       if (existingBook) {
//         // dlt the uploaded file if the book already exists
//         if (req.file && req.file.path) {
//           fs.unlink(path.join(__dirname, '../', req.file.path), (err) => {
//             // if (err) {
//             //   console.error('File deleted because book already exists:', err);
//             // }
//           });
//         }
//         return res.status(400).json({ msg: 'Book already exists' });
//       }

//       const image = req.file ? req.file.path : null;

//       const newBook = new Book({
//         name,
//         author,
//         qty,
//         image,
//       });

//       const book = await newBook.save();
//       return res.status(200).json({ msg: 'Book added successfully', book });
//     } catch (err) {
//       // console.error(err.message);
//       // dlt the uploaded pic if any error occurs while adding book
//       if (req.file && req.file.path) {
//         fs.unlink(path.join(__dirname, '../', req.file.path), (err) => {
//           // if (err) {
//           //   console.error('File deleted because an error occurred:', err);
//           // }
//         });
//       }
//       return res.status(500).json({msg:'Server error'});
//     }
//   }
// );

// router.put(
//   '/updatebook/:id',
//   [auth('admin')],
//   [
//     check('qty', 'Book quantity is required').isInt({ min: 0 }),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { qty } = req.body;

//     try {
//       let book = await Book.findById(req.params.id);

//       if (!book) {
//         return res.status(404).json({ msg: 'Book not found' });
//       }

//       book.qty = qty;

//       await book.save();
//       return res.json({ msg: 'Book quantity updated successfully', book });
//     } catch (err) {
//       // console.error(err.message);
//       return res.status(500).json({ msg: "Server error" });
//     }
//   }
// );

// router.delete('/deletebook/:id', [auth('admin')], async (req, res) => {
//   try {
//     const book = await Book.findById(req.params.id);

//     if (!book) {
//       return res.status(404).json({ msg: 'Book not found' });
//     }
    
//     const issueBook = await Issue.find({ 'book': req.params.id });

//     if (issueBook.length > 0) {
//       return res.status(400).json({ msg: 'This book is currently issued' });
//     }

//     // Check if the path exists before trying to dlt
//     if (book.image && fs.existsSync(path.join(__dirname, '../', book.image))) {
//       fs.unlink(path.join(__dirname, '../', book.image), (err) => {
//         // if (err) {
//         //   console.error('Error while deleting image:', err);
//         // }
//       });
//     }

//     await book.deleteOne();
//     return res.json({ msg: 'Book removed' });
//   } catch (err) {
//     // console.error(err.message);
//     return res.status(500).json({msg:'Server error'});
//   }
// });

// module.exports = router;


const express = require('express');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Issue = require('../models/IssueBook');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only images are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter 
});

router.get('/books', [auth('admin')], async (req, res) => {
  try {
    const books = await Book.find();
    return res.json(books);
  } catch (err) {
    return res.status(500).json({msg:'Server error'});
  }
});

router.post(
  '/addbook',
  [auth('admin')],
  upload.single('image'),
  [
    check('name', 'Book name is required').not().isEmpty(),
    check('author', 'Book author is required').not().isEmpty(),
    check('qty', 'Book quantity is required').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete the uploaded pic if validation fails
      if (req.file && req.file.path) {
        fs.unlink(path.join(__dirname, '../', req.file.path), (err) => {});
      }
      return res.status(400).json({ msg: "Book Validation Failed" });
    }

    const { name, author, qty } = req.body;

    try {
      const existingBook = await Book.findOne({ name, author });
      if (existingBook) {
        // Delete the uploaded file if the book already exists
        if (req.file && req.file.path) {
          fs.unlink(path.join(__dirname, '../', req.file.path), (err) => {});
        }
        return res.status(400).json({ msg: 'Book already exists' });
      }

      const image = req.file ? req.file.path : null;

      const newBook = new Book({
        name,
        author,
        qty,
        image,
      });

      const book = await newBook.save();
      return res.status(200).json({ msg: 'Book added successfully', book });
    } catch (err) {
      // Delete the uploaded pic if any error occurs while adding book
      if (req.file && req.file.path) {
        fs.unlink(path.join(__dirname, '../', req.file.path), (err) => {});
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

router.put(
  '/updatebook/:id',
  [auth('admin')],
  [
    check('qty', 'Book quantity is required').isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { qty } = req.body;

    try {
      let book = await Book.findById(req.params.id);

      if (!book) {
        return res.status(404).json({ msg: 'Book not found' });
      }

      book.qty = qty;

      await book.save();
      return res.json({ msg: 'Book quantity updated successfully', book });
    } catch (err) {
      return res.status(500).json({ msg: "Server error" });
    }
  }
);

router.delete('/deletebook/:id', [auth('admin')], async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    const issueBook = await Issue.find({ 'book': req.params.id });

    if (issueBook.length > 0) {
      return res.status(400).json({ msg: 'This book is currently issued' });
    }

    // Check if the path exists before trying to delete
    if (book.image && fs.existsSync(path.join(__dirname, '../', book.image))) {
      fs.unlink(path.join(__dirname, '../', book.image), (err) => {});
    }

    await book.deleteOne();
    return res.json({ msg: 'Book removed' });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
