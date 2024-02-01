
const express = require('express');
const cors = require('cors')

const passwordsRoute = require('./routes/passwords.route')

const port = process.env.PORT || 8080;
const app = express();
app.use(express.json()); // Add this line to parse JSON bodies

app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/', passwordsRoute);




app.listen(port, () => {
    console.log("Server is listening to port " + port)
});

