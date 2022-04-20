const bcrypt = require('bcrypt');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const Records = require('../models/Records');
const { validationResult } = require('express-validator');

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).redirect('/login');
  } catch (error) {
    const errors = validationResult(req);
    console.log(errors);
    console.log(errors.array()[0].msg);
    for (let i = 0; i < errors.array().length; i++) {
      req.flash('error', `${errors.array()[i].msg}`);
    }
    res.status(400).redirect('/register');
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    await User.findOne({ email: email }, (err, user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, same) => {
          if (same) {
            // User Session
            req.session.userID = user._id;
            res.status(200).redirect('/users/dashboard');
          } else {
            req.flash('error', 'Your password is not correct!');
            res.status(400).redirect('/login');
          }
        });
      } else {
        req.flash('error', 'User is not exist!');
        res.status(400).redirect('/login');
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getDashboardPage = async (req, res) => {
  const user = await User.findOne({ _id: req.session.userID }).populate(
    'courses'
  );
  const categories = await Category.find();
  const courses = await Course.find({ user: req.session.userID });
  const users = await User.find();
  const records = await Records.find();

  res.status(200).render('dashboard', {
    page_name: 'dashboard',
    user,
    categories,
    courses,
    users,
    records,
  });
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    await Course.deleteMany({ user: req.params.id });
    // req.flash("success", `${course.name} has been removed successfully`);

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};


exports.createPhotos = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userID });
    user.photo = true;
    user.save();
    const uploadDir = `public/images/students/${req.session.userID}`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    let arr = req.files;
    for (var k in arr) {
      // console.log(k, arr[k]);
      let uploadedImage = arr[k];
      let uploadedPath =
        __dirname + '/../public/images/students/'+ req.session.userID + '/'+ req.session.userID + '-' + k + '.png';
      uploadedImage.mv(uploadedPath);
    }

    res.status(200).redirect('/users/dashboard/upload/process');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
}

exports.resizePhoto = async (req, res) => {
  try {
    for(let i = 1; i < 4; i++) {
      let uploadedPath = `${__dirname}/../public/images/students/${req.session.userID}/${req.session.userID}-image${i}.png`;
      const image = await Jimp.read(uploadedPath);
    
      await image
        .resize(150, 150)
        .greyscale()
        .writeAsync(uploadedPath);
    }
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
