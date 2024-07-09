const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/studentprofile', auth('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role');
    if (!user) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.json(user);
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/adminprofile', auth('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role ');
    if (!user) {
      return res.status(404).json({ msg: 'Admin not found' });
    }
    res.json(user);
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
