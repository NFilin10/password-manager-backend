
const express = require('express')
const { login, logout, signup, authenticate } = require('../controllers/authController')
const router = express.Router()

router.get('/authenticate', authenticate)
router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)






module.exports = router;
