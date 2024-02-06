const express = require('express');
const pool = require("../database");

const jwt = require('jsonwebtoken');
const secret = "gdgdhdbcb770785rgdzqws";
const maxAge = 60 * 600;

const decodeJWT = (token) => {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded.id; // Extract the id from the decoded token
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const getCategory = async (req, res) => {

    const token = req.cookies.jwt;
    console.log("TOKEN", token)

    const userID = decodeJWT(token)

    const categories = await pool.query(
        `SELECT c."category_name"
             FROM "user_categories" uc
             JOIN "categories" c ON uc."id" = c."id"
             WHERE uc."user_id" = $1`,
        [userID]
    );
    res.json(categories.rows);
    console.log("HERE", categories.rows)
}

const addCategory = async (req, res) => {
    console.log("BODY:", req.body);
    const data = req.body;
    const token = req.cookies.jwt;

    const userID = decodeJWT(token);

    try {
        await pool.query(
            "INSERT INTO categories (category_name) VALUES ($1);",
            [data.category]
        );

        await pool.query(
            "INSERT INTO user_categories (user_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE category_name = $2))",
            [userID, data.category]
        );

        res.status(201).json({ message: 'Category added successfully' });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    addCategory,
    getCategory
};
