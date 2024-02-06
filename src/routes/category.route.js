
const express = require('express')
const { addCategory, getCategory } = require('../controllers/categoryController')
const router = express.Router()

router.get('/categories', getCategory)
router.post('/new-category', addCategory)


module.exports = router;
