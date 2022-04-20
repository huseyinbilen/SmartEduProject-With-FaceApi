const mongoose = require('mongoose');
const slugify = require('slugify');
const Schema = mongoose.Schema;

const RecordsSchema = new Schema({
  courseName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  finishedAt: {
    type: Date,
    // required: false,
    default: null
  },
  students:[{
    type: Object,
  //   studentID: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User'
  //   },
  //   ratio: {
  //     type: String,
  //     default: '0asdasd'
  // }
  }],
    
});

const Records = mongoose.model('Records', RecordsSchema);
module.exports = Records;
