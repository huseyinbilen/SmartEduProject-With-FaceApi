const Records = require('../models/Records');

exports.createRecords = async (req, res) => {
    try {
      const records = await Records.create({
        courseName: req.body.courseName
      });
  
      res.status(201).redirect('/users/dashboard')
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        error,
      });
    }
  };
  