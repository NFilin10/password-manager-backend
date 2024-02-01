
const express = require('express')
const { getPasswords, addPassword } = require('../controllers/passwordController')
const router = express.Router()

router.get('/', getPasswords)
router.post('/add', addPassword)


module.exports = router;
