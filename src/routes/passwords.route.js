
const express = require('express')
const { getPasswords } = require('../controllers/passwordController')
const router = express.Router()

router.get('/', getPasswords)

module.exports = router;
