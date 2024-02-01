
const express = require('express');
const pool = require('./database');

const passwordsRoute = require('./routes/passwords.route')

const port = process.env.PORT || 3000;
const app = express();


// app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
app.use('/', passwordsRoute);

app.listen(port, () => {
    console.log("Server is listening to port " + port)
});

//
// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })
