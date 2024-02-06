
const express = require('express');
const cors = require('cors')
const passwordsRoute = require('./routes/passwords.route')
const authRoute = require('./routes/auth.route')
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 8080;
const app = express();


app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());



app.use('/', passwordsRoute);
app.use('/auth/', authRoute);





app.listen(port, () => {
    console.log("Server is listening to port " + port)
});

