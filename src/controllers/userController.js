const express = require('express');
const pool = require("../database");

const jwt = require('jsonwebtoken');
const secret = process.env.SECRET




const decodeJWT = (token) => {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded.id; // Extract the id from the decoded token
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const getUser = async (req, res) => {
    const token = req.cookies.jwt;

    const userID = decodeJWT(token)

    const user = await pool.query(
        `SELECT name, surname, image FROM users WHERE id=$1`,
        [userID]
    );

    res.json(user.rows);
    console.log("USER", user.rows)
}






module.exports = {
    getUser,
};
