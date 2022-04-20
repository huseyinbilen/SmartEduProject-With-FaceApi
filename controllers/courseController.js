const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const Records = require('../models/Records');

const path = require('path');
const fs = require('fs');

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      user: req.session.userID,
    });

    req.flash('success', `${course.name} has been created`);
    res.status(201).redirect('/courses');
  } catch (error) {
    req.flash('error', `Something Wrong!`);
    res.status(400).redirect('/courses');
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const categorySlug = req.query.categories;
    const query = req.query.search;

    const category = await Category.findOne({ slug: categorySlug });

    let filter = {};

    if (categorySlug) {
      filter = { category: category._id };
    }

    if (query) {
      filter = { name: query };
    }

    if (!query && !categorySlug) {
      filter.name = '';
      filter.category = null;
    }

    const courses = await Course.find({
      $or: [
        { name: { $regex: '.*' + filter.name + '.*', $options: 'i' } },
        { category: filter.category },
      ],
    })
      .sort('-createdAt')
      .populate('user');

    const categories = await Category.find();

    res.status(200).render('courses', {
      courses,
      categories,
      page_name: 'courses',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    const course = await Course.findOne({ slug: req.params.slug }).populate(
      'user'
    );
    const categories = await Category.find();

    res.status(200).render('course', {
      course,
      page_name: 'courses',
      user,
      categories,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    await user.courses.push({ _id: req.body.course_id });
    await user.save();

    res.status(201).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.releaseCourse = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    await user.courses.pull({ _id: req.body.course_id });
    await user.save();

    res.status(201).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndRemove({ slug: req.params.slug });

    req.flash('success', `${course.name} has been removed successfully`);

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    // if (!req.body.isStarted) {
    course.name = req.body.name;
    course.description = req.body.description;
    course.category = req.body.category;

    req.flash('success', `${course.name} has been updated successfully`);
    // } else {
    //   course.isStarted = req.body.isStarted;
    //   if (course.isStarted == true) {
    //     req.flash('success', `${course.name} has been started successfully`);
    //     const records = await Records.create({
    //       courseName: req.body.courseName,
    //     });
    //     course.lastLesson = records._id;
    //   } else {
    //     req.flash('success', `${course.name} has been finished successfully`);
    //     const records = await Records.findById(req.body.lastLesson);
    //     records.finishedAt = Date.now();
    //     records.save();
    //   }
    // }
    course.save();

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.startLesson = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    course.isStarted = req.body.isStarted;
    // if (course.isStarted == true) {
    //   req.flash('success', `${course.name} has been started successfully`);
    //   const records = await Records.create({
    //     courseName: req.body.courseName,
    //   });
    //   course.lastLesson = records._id;
    // } else {
    //   req.flash('success', `${course.name} has been finished successfully`);
    //   const records = await Records.findById(req.body.lastLesson);
    //   records.finishedAt = Date.now();
    //   records.save();
    // }
    req.flash('success', `${course.name} has been started successfully`);
    const records = await Records.create({
      courseName: req.body.courseName,
    });
    course.lastLesson = records._id;
    course.save();
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.stopLesson = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    course.isStarted = req.body.isStarted;
    req.flash('success', `${course.name} has been finished successfully`);
    const records = await Records.findById(req.body.lastLesson);
    records.finishedAt = Date.now();
    const timeDiff = parseInt((records.finishedAt.getTime() - records.createdAt.getTime()) /1000);
    console.log(timeDiff); 
    records.students.forEach((element, index) => {
      console.log(parseInt((Number(records.students[index].count)/timeDiff)*100));
      records.students[index].ratio = parseInt((Number(records.students[index].count)/timeDiff)*100);
    });
    records.markModified('students');
    records.save();
    course.save();
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.joinLesson = async (req, res) => {
  try {
    // const records = await Records.findById(req.body.lastLesson);

    // // Stop same students id aading list
    // if (
    //   !records.students.find((currentValue) => {
    //     return currentValue == req.session.userID;
    //   })
    // ) {
    //   await records.students.push({ _id: req.session.userID, ratio: '0' });
    //   await records.save();
    // }

    const records = await Records.findById(req.body.lastLesson);
    // Stop same students id aading list
    if (
      !records.students.find((currentValue) => {
        return currentValue._id == req.session.userID;
      })
    ) {
      await records.students.push({
        _id: req.session.userID,
        count: 0,
        ratio: '0',
      });
      await records.save();
    }

    res.status(201).redirect(`/courses/live/${req.body.lastLesson}`);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.getLiveLesson = async (req, res) => {
  try {
    const records = await Records.findById(req.params.slug);
    const person = req.session.userID;
    if (records.finishedAt == null) {
      let foldersName = fs.readdirSync(
        __dirname + '/../public/images/students'
      );
      res.render('livelesson', {
        list: foldersName,
        records,
        person
      });
    } else {
      res.send('Lesson Finished');
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.ratioUpdate = async (req, res) => {
  try {
    const records = await Records.findById(req.params.slug);
    if (records.finishedAt == null) {
      let student;
      records.students.forEach((element, index) => {
        return element._id == req.session.userID ? (student = index) : null;
      });
      records.students[student].count =
        Number(records.students[student].count) + Number(req.body.count);
      records.students[student].ratio = req.body.ratio;
      await records.markModified('students');
      await records.save();
      res.send('success');
    } else {
      res.send('Lesson Finished');
    }
    // console.log(req.body);
    // console.log(req.body.ratio);
    // res.send('testttt');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
