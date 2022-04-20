const express = require('express');
const courseController = require('../controllers/courseController')
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').post(roleMiddleware(["teacher", "admin"]), courseController.createCourse);
router.route('/').get(courseController.getAllCourses);
router.route('/:slug').get(courseController.getCourse);
router.route('/:slug').delete(courseController.deleteCourse);
router.route('/:slug').put(courseController.updateCourse);
router.route('/enroll').post(courseController.enrollCourse);
router.route('/release').post(courseController.releaseCourse);
router.route('/join').post(courseController.joinLesson);
router.route('/live/:slug').get(authMiddleware, courseController.getLiveLesson);
router.route('/live/:slug').put(authMiddleware, courseController.startLesson);
router.route('/live/stop/:slug').put(courseController.stopLesson);
router.route('/ratio-update/:slug').post(courseController.ratioUpdate);

module.exports = router;