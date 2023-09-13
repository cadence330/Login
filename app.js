const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/userModel');

const app = express();

const dbURI = 'mongodb+srv://domonicdavis20:cexFiBuzvCMgfgQ2@user-data.gydghdn.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbURI, {
  dbName: 'User-Information'
})
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', (req, res) => {
  try {
    const newUser = new User({
      email: req.body.email,
      password: req.body.password
      });

    newUser.save();
  } catch (error) {
    console.error(error);
  }

});
