const pool = require("../database");
const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const secret = process.env.SECRET
const maxAge = 24 * 60 * 60 * 1000;

const generateJWT = (id) => {
    return jwt.sign({ id }, secret, { expiresIn: maxAge })
}

const authenticate = async (req, res) => {
    const token = req.cookies.jwt;
    let authenticated = false;

    try {
        if (token) {
            const decodedToken = jwt.verify(token, secret);
            authenticated = true;
        }
    } catch (err) {
        console.error(err.message);
    }

    res
       .status(201).send({ authenticated });

};


const signup = async(req, res) => {
    try {
        const {login, email, password } = req.body;

        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length !== 0) return res.status(401).json({ error: "User is already registered" });

        const salt = await bcrypt.genSalt();
        const bcryptPassword = await bcrypt.hash(password, salt)
        const authUser = await pool.query(
            "INSERT INTO users(username, email, password) values ($1, $2, $3) RETURNING*", [login, email, bcryptPassword]
        );
        const token = await generateJWT(authUser.rows[0].id); // generates a JWT by taking the user id as an input (payload)
        res
            .cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge,
                overwrite: true,
                sameSite: "none",
                secure: true
            })
            .json({ user_id: user.rows[0].id }).status(201).send();
    } catch (err) {
        console.error(err.message);
        res.status(400).send(err.message);
    }
};

const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(401).json({ error: "User is not registered" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json({ error: "Incorrect password" });

        const token = await generateJWT(user.rows[0].id);
        res
            .cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge,
                overwrite: true,
                sameSite: "none",
                secure: true
            })
            .json({ user_id: user.rows[0].id }).status(201);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

// const logout = async (req, res) => {
//     res.status(202).clearCookie('jwt').json({ "Msg": "cookie cleared" }).send(); // <-- Corrected
// };

const logout = async (req, res) => {
    res.clearCookie("jwt", {
        secure: true,
        httpOnly: true,
        sameSite: "none"
    }).status(200).json({ "Msg": "cookie cleared" })
};



module.exports = {
    authenticate,
    signup,
    login,
    logout
}