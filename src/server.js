
const express = require('express');
const cors = require('cors')
const passwordsRoute = require('./routes/passwords.route')
const authRoute = require('./routes/auth.route')
const categoryRoute = require('./routes/category.route')
require('dotenv').config();

const cookieParser = require('cookie-parser');

const port = process.env.PORT || 8080;
const app = express();


app.use(cors({ origin: 'https://password-manager-frontend-ten.vercel.app:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());



app.use('/', passwordsRoute);
app.use('/auth/', authRoute);
app.use('/', categoryRoute);






const server = app.listen(port, () => {
    console.log("Server is listening to port " + port);
});

module.exports = server;

