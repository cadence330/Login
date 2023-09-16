const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const app = express();

const dbURI = process.env.DB_URI_LOGIN;

mongoose.connect(dbURI, {
  dbName: 'User-Information'
})
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
})

// User Login 
app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', async (req, res) => {

  const { usernameOrEmail, password } = req.body;

  try {
    const userByUsername = await User.findOne({ username: usernameOrEmail });

    const userByEmail = await User.findOne({ email: usernameOrEmail });

    const user = userByUsername || userByEmail;

    if (!user) {
      return res.status(404).send('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // req.session.userId = user._id;
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Incorrect password.');
    }
  } catch (error) {
    console.error(error);
  }
})

// Create a New Account
app.get('/create', (req, res) => {
  res.render('create');
})

app.post('/create', async (req, res) => {
  try {
    const hashedPassword = 
    await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword
      });

    await newUser.save();

    res.status(201).send('User registered succesfully!');

  } catch (error) {
    console.error(error);
  }
})

// Reset Password
app.get('/reset-password', (req, res) => {
  res.render('reset-password')
})

app.post('/reset-password', (req, res) => {
  const userEmail = req.body.email;
})


