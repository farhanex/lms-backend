const express = require('express');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Issue = require('../models/IssueBook');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('File must be an image'));
    }
    cb(null, true);
  },
});

router.get('/books', [auth('admin')], async (req, res) => {
  try {
    const books = await Book.find();
    return res.json(books);
  } catch (err) {
    return res.status(500).send('Server error');
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
      // Dlt the uploaded image if validation fails
      return res.status(400).json({ msg:" book validation failed"});
    }

    const { name, author, qty } = req.body;

    try {
      const existingBook = await Book.findOne({ name, author });
      if (existingBook) {
        return res.status(400).json({ msg: 'Book already exists' });
      }

      let imagePath = null;

      if (req.file) {
        // Resize the image using sharp
        const resizedImageBuffer = await sharp(req.file.buffer)
          .resize(200, 200)
          .toBuffer();

        const fileName = `${Date.now()}-${req.file.originalname}`;
        imagePath = `uploads/${fileName}`;

        // Save the resized image to disk
        fs.writeFileSync(imagePath, resizedImageBuffer);
      }

      const newBook = new Book({
        name,
        author,
        qty,
        image: imagePath,
      });

      const book = await newBook.save();
      return res.status(200).json({ msg: 'Book added successfully', book });
    } catch (err) {
      if (req.file && imagePath) {
        fs.unlinkSync(imagePath);
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
      return res.status(400).json({ msg:'book validation failed' });
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
      return res.status(500).json({ msg: 'Server error' });
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
      return res.status(400).json({ msg: 'This book is currently alloted to student' });
    }

    // Check if the path exists before trying to dlt
    if (book.image && fs.existsSync(book.image)) {
      fs.unlinkSync(book.image);
    }

    await book.deleteOne();
    return res.json({ msg: 'Book removed' });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
