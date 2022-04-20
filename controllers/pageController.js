const nodemailer = require('nodemailer');
const Jimp = require('jimp');
const Course = require('../models/Course');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

exports.getIndexPage = async (req, res) => {
  const courses = await Course.find().sort('-createdAt').limit(2);
  const totalCourses = await Course.find().countDocuments();
  const totalStudent = await User.countDocuments({ role: 'student' });
  const totalTeacher = await User.countDocuments({ role: 'teacher' });

  res.status(200).render('index', {
    page_name: 'index',
    courses,
    totalCourses,
    totalStudent,
    totalTeacher,
  });
};

exports.getAboutPage = (req, res) => {
  res.status(200).render('about', {
    page_name: 'about',
  });
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render('register', {
    page_name: 'register',
  });
};

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    page_name: 'login',
  });
};

exports.getContactPage = (req, res) => {
  res.status(200).render('contact', {
    page_name: 'contact',
  });
};

exports.sendEmail = async (req, res) => {
  try {
    const outputMessage = `
  
    <h1>Mail Details</h1>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
      <h1>Message</h1>
      <p>${req.body.message}</p>
    </ul>
  `;
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'bilennhuseyinn@gmail.com', // generated ethereal user
        pass: 'funyctgimgodtjsx', // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Smart EDU Contact From" <bilennhuseyinn@gmail.com>', // sender address
      to: 'huseyin.bilen@outlook.com.tr', // list of receivers
      subject: 'Smart EDU Contact From New Message ✔', // Subject line
      html: outputMessage, // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    req.flash('success', 'We Received Your Message Succesfully');

    res.status(200).redirect('/contact');
  } catch (err) {
    req.flash('error', 'Something Wrong!');
    res.status(200).redirect('/contact');
  }
};

// exports.createPhotos = async (req, res) => {
//   try {
//     const uploadDir = 'public/images/students/uploads';

//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     let arr = req.files;
//     for (var k in arr) {
//       // console.log(k, arr[k]);
//       let uploadedImage = arr[k];
//       let uploadedPath =
//         __dirname + '/../public/images/students/uploads/' + k + '.jpg';
//       uploadedImage.mv(uploadedPath);
//     }

//     // await imageResize(1);
//     // for(let i = 1; i <= 3; i++) {
//     //   let uploadedPath = __dirname +'/../public/images/students/uploads/image' + i + '.png';
//     //   Jimp.read(uploadedPath, (err, lenna) => {
//     //     if (err) throw err;
//     //     lenna
//     //       .resize(150, 150) // resize
//     //       .quality(100) // set JPEG quality
//     //       .greyscale() // set greyscale
//     //       .write(`${uploadedPath}`); // save
//     //   });
//     // }
//     // let i = 1;
//     // let uploadedPath = `${__dirname}/../public/images/students/uploads/image${i}.png`;
//     // Jimp.read(uploadedPath, (err, lenna) => {
//     //   if (err) throw err;
//     //   lenna
//     //     .resize(150, 150) // resize
//     //     .quality(50) // set JPEG quality
//     //     .greyscale() // set greyscale
//     //     .writeAsync(uploadedPath); // save
//     // });


//     res.status(200).redirect('/upload/process');
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       error,
//     });
//   }
// }

// exports.resizePhoto = async (req, res) => {
//   try {
//     for(let i = 1; i < 4; i++) {
//       let uploadedPath = `${__dirname}/../public/images/students/uploads/image${i}.jpg`;
//       const image = await Jimp.read(uploadedPath);
    
//       await image
//         .resize(150, 150)
//         .greyscale()
//         .writeAsync(uploadedPath);
//     }
//     res.status(200).redirect('/test');
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       error,
//     });
//   }
// };
