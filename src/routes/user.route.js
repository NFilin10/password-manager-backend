
const express = require('express')
const { getUser, getImg } = require('./../controllers/userController')
const authenticateMiddleware = require('./../middlewares/authenticate.middleware');

const router = express.Router()

router.get('/user', authenticateMiddleware, getUser)
router.get(/^\/image.*/, authenticateMiddleware);







module.exports = router;
