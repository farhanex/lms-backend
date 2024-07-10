const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');
const Issue = require('../models/IssueBook');
const auth = require('../middleware/auth');
const moment = require('moment-timezone');

const router = express.Router();

router.get('/student/:email', auth('admin'), async (req, res) => {
  try {
    const { email } = req.params;
    const student = await User.findOne({ email });

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post(
  '/issuebook',
  [auth('admin')],
  [
    check('studentName', 'Student name is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('classRollNo', 'Class roll number is required').not().isEmpty(),
    check('phoneNo', 'Phone number is required').not().isEmpty(),
    check('department', 'Department is required').not().isEmpty(),
    check('session', 'Session is required').not().isEmpty(),
    check('bookId', 'Book ID is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      studentName,
      email,
      classRollNo,
      phoneNo,
      department,
      session,
      bookId,
    } = req.body;

    try {
      let student = await User.findOne({ email });

      if (!student) {
        const password = `${studentName}123`; 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        student = new User({
          name: studentName,
          email,
          password: hashedPassword,
          role: 'student',
          phoneNo,
          classRollNo,
          department,
          session,
        });

        await student.save();
      }

      const existingIssue = await Issue.findOne({
        student: student._id, 
        book: bookId,
      });

      if (existingIssue) {
        return res.status(400).json({ msg: 'Student has already issued this book' });
      }

      const book = await Book.findById(bookId);

      if (!book) {
        return res.status(404).json({ msg: 'Book not found' });
      }

      if (book.qty < 1) {
        return res.status(400).json({ msg: 'Book out of stock' });
      }

      const issuedDate = moment.tz('Asia/Kolkata');
      const returnDate = issuedDate.clone().add(25, 'days');

      const issue = new Issue({
        book: book.id,
        student: student._id, 
        issuedDate: issuedDate.format('YYYY-MM-DD hh:mm:ss A'),
        returnDate: returnDate.format('YYYY-MM-DD hh:mm:ss A'),
      });

      await issue.save();

      book.qty -= 1;
      await book.save();

      res.status(200).json({ msg: 'Book issue successfully', issue });
    } catch (err) {
      // console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.post('/returnbook', auth('admin',true), async (req, res) => {
  const { issueId } = req.body;

  try {
    let issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ msg: 'Issue record not found' });
    }

    let book = await Book.findById(issue.book);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    book.qty += 1;
    await book.save();

    await Issue.findByIdAndDelete(issueId);

    res.json({ msg: 'Book returned successfully' });
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/myhistory', auth('student'), async (req, res) => {
  try {
    const issues = await Issue.find({ student: req.user.id }).populate('book', ['name', 'author']);
    const history = issues.map(issue => {
      const currentDate = moment.tz('Asia/Kolkata');
      const returnDate = moment(issue.returnDate, 'YYYY-MM-DD hh:mm:ss A').tz('Asia/Kolkata');
      const daysLeft = returnDate.diff(currentDate, 'days');
      const isLate = currentDate.isAfter(returnDate);
      let lateFine = 0;

      if (isLate) {
        const daysLate = currentDate.diff(returnDate, 'days');
        lateFine = daysLate * 10; 
      }

      return {
        issueId: issue._id,
        book: {
          name: issue.book.name,
          author: issue.book.author,
        },
        issuedDate: moment(issue.issuedDate, 'YYYY-MM-DD hh:mm:ss A').tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A'),
        returnDate: moment(issue.returnDate, 'YYYY-MM-DD hh:mm:ss A').tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A'),
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        lateFine: lateFine,
      };
    });

    res.json(history);
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/bookholders', auth('admin'), async (req, res) => {
  try {
    const issues = await Issue.find().populate('book', ['name', 'author']).populate('student', '-password -role');
    const holders = issues.map(issue => {
      const currentDate = moment.tz('Asia/Kolkata');
      const returnDate = moment(issue.returnDate, 'YYYY-MM-DD hh:mm:ss A').tz('Asia/Kolkata');
      const daysLate = currentDate.diff(returnDate, 'days');
      const dayLeft = returnDate.diff(currentDate, 'days');
      let lateFee = 0;

      if (daysLate > 0) {
          lateFee = daysLate * 10;
      }

      return {
        issueId: issue._id,
        student: {
          id: issue.student._id,
          name: issue.student.name,
          phoneNo: issue.student.phoneNo,
          email: issue.student.email,
          classRollNo: issue.student.classRollNo,
          department: issue.student.department,
          session: issue.student.session,
        },
        book: {
          name: issue.book.name,
          author: issue.book.author,
        },
        issuedDate: moment(issue.issuedDate, 'YYYY-MM-DD hh:mm:ss A').tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A'),
        returnDate: moment(issue.returnDate, 'YYYY-MM-DD hh:mm:ss A').tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A'),
        daysLeft: dayLeft > 0 ? dayLeft : 0,
        isLate: daysLate > 0,
        lateFee: lateFee
      };
    });

    res.json(holders);
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
