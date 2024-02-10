
const express = require('express')
const { getUser } = require('./../controllers/userController')
const authenticateMiddleware = require('./../middlewares/authenticate.middleware');

const router = express.Router()

router.get('/user', authenticateMiddleware, getUser)




module.exports = router;
