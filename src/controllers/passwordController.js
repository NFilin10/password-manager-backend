
const express = require('express')
const pool = require("../database");

const getPasswords = async (req, res) => {
    console.log("A GET all request has arrived");
    const course = await pool.query(
        "SELECT * FROM passwords"
    );
    res.json(course.rows);
}

module.exports = {
    getPasswords
};