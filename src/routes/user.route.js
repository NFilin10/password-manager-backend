
const express = require('express')

const authenticateMiddleware = require('./../middlewares/authenticate.middleware');

const router = express.Router()

router.get('/user', authenticateMiddleware, getPasswords)




module.exports = router;
