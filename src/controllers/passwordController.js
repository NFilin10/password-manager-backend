const express = require('express');
const pool = require("../database");

const getPasswords = async (req, res) => {
    console.log("A GET all request has arrived");
    try {
        const passwords = await pool.query(
            `SELECT p.*, c.id AS category_id, c.category_name
             FROM passwords p
             LEFT JOIN password_categories pc ON p.id = pc.password_id
             LEFT JOIN categories c ON pc.category_id = c.id`
        );

        // Group passwords by password id and collect categories into an array
        const groupedPasswords = passwords.rows.reduce((acc, row) => {
            const { id, service_name, link, login, password, logo, category_id, category_name } = row;
            if (!acc[id]) {
                acc[id] = { id, service_name, link, login, password, logo, categories: [] };
            }
            if (category_id) {
                acc[id].categories.push({ category_id, category_name });
            }
            return acc;
        }, {});

        res.json(Object.values(groupedPasswords));
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const addPassword = async (req, res) => {
    console.log("BODY:", req.body);
    const data = req.body;

    try {
        const passwordInsertResult = await pool.query(
            "INSERT INTO passwords (service_name, link, login, password, logo) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [data.website, data.webLink, data.login, data.password, (data.logo).toLowerCase()]
        );

        const passwordID = passwordInsertResult.rows[0].id;

        // Assuming data.categories is an array of category names
        for (const categoryName of data.categories) {
            const categoryQueryResult = await pool.query(
                "SELECT id FROM categories WHERE category_name = $1",
                [categoryName]
            );

            const categoryID = categoryQueryResult.rows[0].id;

            const categoryInsertResult = await pool.query(
                "INSERT INTO password_categories (password_id, category_id) VALUES ($1, $2)",
                [passwordID, categoryID]
            );
        }

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
