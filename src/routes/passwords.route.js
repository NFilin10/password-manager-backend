
const express = require('express')
const { getPasswords, addPassword, deletePassword, updatePassword } = require('../controllers/passwordController')
const authenticateMiddleware = require('./../middlewares/authenticate.middleware');

const router = express.Router()

router.get('/', authenticateMiddleware, getPasswords)
router.post('/add', authenticateMiddleware, addPassword)
router.delete('/delete/:id', authenticateMiddleware, deletePassword)
router.put('/update/:id', authenticateMiddleware, updatePassword)



module.exports = router;
