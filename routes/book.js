const express = require('express');
const { check, validationResult } = require('express-validator');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();
const Issue = require('../models/IssueBook');

router.get('/books', [auth('admin')], async (req, res) => {
  try {
    const books = await Book.find();
    return res.json(books);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

router.post(
  '/addbook',
  [auth('admin')],
  [
    check('name', 'Book name is required').not().isEmpty(),
    check('author', 'Book author is required').not().isEmpty(),
    check('qty', 'Book quantity is required').isInt({ min: 1 }),
    check('image', 'Image URL is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Book Validation Failed", errors: errors.array() });
    }

    const { name, author, qty, image } = req.body;

    try {
      const existingBook = await Book.findOne({ name, author });
      if (existingBook) {
        return res.status(400).json({ msg: 'Book already exists' });
      }

      const newBook = new Book({
        name,
        author,
        qty,
        image,
      });

      const book = await newBook.save();
      return res.status(200).json({ msg: 'Book added successfully', book });
    } catch (err) {
      console.error(err.message);
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
      console.error(err.message);
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
      return res.status(400).json({ msg: 'This book is currently issued by student' });
    }

    await book.deleteOne();
    return res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
