const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const generateResetPassword = require('./public/scripts/reset-password');
const { isAuthenticated } = require('./public/scripts/authentication')

const app = express();

const dbURI = process.env.DB_URI_LOGIN;

mongoose.connect(dbURI, {
  dbName: 'User-Information'
})
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(
  session({
    secret: "test for now and fix later",
    resave: false,
    saveUninitialized: false,
  })
)
app.use(express.static('public', { 
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  },
}));

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
      req.session.userId = user._id;
      res.redirect('/dashboard');
      // res.cookie('Sky', 'blue', { httpOnly: true })
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

app.post('/reset-password', async (req, res) => {
  try {
    const userEmail = req.body.email;

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      res.send('Email not found')
    } else {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'domonic.davis.test@gmail.com',
          pass: process.env.EMAIL_AUTHORIZATION
        }
      });

      const temporaryPassword = generateResetPassword();

      const hashedTemporaryPassword =
      await bcrypt.hash(temporaryPassword, 10);

      user.temporaryPassword = hashedTemporaryPassword;

      const updatedUser = await user.save();
      console.log('User updated successfully:', updatedUser);
      
      const mailOptions = {
        from: 'domonic.davis.test@gmail.com',
        to: userEmail,
        subject: 'Reset Password',
        text: `Your temporary password is ${temporaryPassword}: Please click the link to reset password. `,
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
        console.error('Error sending email:', error);
        res.send("User not found")
      } else {
        console.log('Email sent:', info.response);
      }
      });
    
      res.send('Email Sent');
    }

  } catch (error) {
    console.log('error found', error);
  }
})

// New Password
  app.get('/new-password', async (req, res) => {
    res.render('new-password')
  })

  app.post('/new-password', async (req, res) => {
    try {
      const userEmail = req.body.email;
      const userTemporaryPassword = req.body['temporary-password'];
      const userNewPassword = req.body['new-password'];
      const confirmNewPassword = req.body['confirm-new-password'];

      const userByEmail = await User.findOne({ email: userEmail });

      const temporaryPasswordMatch = await bcrypt.compare(userTemporaryPassword, userByEmail.temporaryPassword);

      if (!userByEmail) {
        return res.status(400).send('Email not found');
      }
  
      if (!temporaryPasswordMatch) {
        return res.status(400).send("Invalid temporary password");
      }
  
      if (userNewPassword !== confirmNewPassword) {
        return res.status(400).send("Passwords do not match");
      }

      const hashedPassword = 
      await bcrypt.hash(userNewPassword, 10);

      userByEmail.password = hashedPassword;
      const updatedUser = await userByEmail.save();

      console.log('Password updated successfully:', updatedUser);

      res.send(`Your password has successfully been reset!\n <button class="LoginBtn">Login</button>`)
  } 
  catch (error) {
    console.log('Error', error)
    res.status(500).send('Internal Server Error');
  }})

  // Dashboard
  app.get('/dashboard', isAuthenticated, async (req, res) => {
    const user = await User.findOne({ _id: req.session.userId });
    const name = user.firstName;
    res.render('dashboard', { name });
  })

  // Logout
  app.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log('Error destroying session:', err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('logout');
      }
    })
  })

