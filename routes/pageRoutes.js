const express = require('express');

const pageController = require('../controllers/pageController')
const redirectMiddleware = require('../middlewares/redirectMiddleware');

const router = express.Router();

router.route('/').get(pageController.getIndexPage);
router.route('/about').get(pageController.getAboutPage);
router.route('/register').get(redirectMiddleware, pageController.getRegisterPage);
router.route('/login').get(redirectMiddleware, pageController.getLoginPage);
router.route('/contact').get(pageController.getContactPage);
router.route('/contact').post(pageController.sendEmail);
// router.route('/upload').post(pageController.createPhotos);
// router.route('/upload/process').get(pageController.resizePhoto);

module.exports = router;