const express = require('express');
const pool = require("../database");

const getPasswords = async (req, res) => {
    console.log("A GET all request has arrived");
    const course = await pool.query(
        "SELECT * FROM passwords"
    );
    res.json(course.rows);
}

const addPassword = async (req, res) => {
    console.log("BODY:", req.body);
    const data = req.body;

    try {
        await pool.query(
            "INSERT INTO passwords (service_name, link, login, password) VALUES ($1, $2, $3, $4)",
            [data.website, data.webLink, data.login, data.password]
        );
        res.status(201).json({ message: 'Password added successfully' });
    } catch (error) {
        console.error('Error adding password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getPasswords,
    addPassword
};
