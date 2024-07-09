const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;


router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['admin']),
    check('secretKey', 'Secret key is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, secretKey } = req.body;

    try {
      if (secretKey !== JWT_SECRET) {
        return res.status(403).json({ msg: 'Invalid secret key' });
      }

      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });

      await user.save();
      res.status(200).json({msg:"admin registred successfully"})

      // const payload = {
      //   user: {
      //     id: user.id,
      //     role: user.role,
      //   },
      // };

      // jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      //   if (err) throw err;
      //   res.cookie('token', token, { httpOnly: true }).json({ token,msg:"admin registred successfully" });
      // });
    } catch (err) {
      // console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    check('role', 'Role is required').isIn(['admin']),
    check('secretKey', 'Secret key is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, secretKey } = req.body;

    try {
      if (secretKey !== JWT_SECRET) {
        return res.status(403).json({ msg: 'Invalid secret key' });
      }

      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'admin not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'wrong password' });
      }

      if (user.role !== role) {
        return res.status(400).json({ msg: 'Role mismatch' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(payload, JWT_SECRET, (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true }).json({ token,msg:"admin logged in successfully",user:{role:"admin"}});
      });
    } catch (err) {
      // console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.post(
  '/student/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    check('role', 'Role is required').isIn(['student']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'student not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'wrong password' });
      }

      if (user.role !== role) {
        return res.status(400).json({ msg: 'Role mismatch' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(payload, JWT_SECRET, (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true }).json({ token,msg:"student login successfully" ,user:{ role:"student"}});
      });
    } catch (err) {
      // console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ msg: 'Logged out successfully' });
});

module.exports = router;

