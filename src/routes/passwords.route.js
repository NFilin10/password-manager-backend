
const express = require('express')
const { getPasswords, addPassword, deletePassword } = require('../controllers/passwordController')
const router = express.Router()

router.get('/', getPasswords)
router.post('/add', addPassword)
router.delete('/delete/:id', deletePassword)



module.exports = router;
