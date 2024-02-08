
const express = require('express')
const { getPasswords, addPassword, deletePassword, updatePassword } = require('../controllers/passwordController')
const authenticateMiddleware = require('./../middlewares/authenticate.middleware');

const router = express.Router()

router.get('/', getPasswords)
router.post('/add', addPassword)
router.delete('/delete/:id', deletePassword)
router.put('/update/:id', updatePassword)



module.exports = router;
