const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/book', require('./routes/book')); 
app.use('/api/issuebooks',require('./routes/issue'))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
