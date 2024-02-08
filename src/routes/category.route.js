
const express = require('express')
const { addCategory, getCategory } = require('../controllers/categoryController')
const router = express.Router()

const authenticateMiddleware = require('./../middlewares/authenticate.middleware');
console.log('getCategory function:', getCategory); // Add this line for debugging


router.get('/categories', authenticateMiddleware, getCategory)
router.post('/new-category', authenticateMiddleware, addCategory)


module.exports = router;
