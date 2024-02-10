const express = require('express');
const pool = require("../database");
const crypto = require('crypto');
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

function encryptPassword(text, masterPassword) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    encrypted = salt.toString('hex') + encrypted + iv.toString('hex'); // Convert salt and iv to hex strings
    return encrypted;
}


function decryptPassword(encryptedData, salt, iv, masterPassword) {
    const key = crypto.pbkdf2Sync(masterPassword, Buffer.from(salt, 'hex'), 100000, 32, 'sha512');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}



function passwordStrength(password) {
    let points = 0;
    if (password.length > 12) {
        points += 2;
    } else if (password.length > 6) {
        points += 1;
    }

    if (/[A-Z]/.test(password)) {
        points += 1;
    }

    if (/[a-z]/.test(password)) {
        points += 1;
    }

    if (/\d/.test(password)) {
        points += 1;
    }

    if (/\W/.test(password)) {
        points += 1;
    }

    const totalPoints = 7;

    return (points / totalPoints) * 100;
}


const getPasswords = async (req, res) => {
    console.log("A GET all request has arrived");

    const token = req.cookies.jwt;
    const userID = decodeJWT(token)
    console.log(userID)

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [userID]);
    if (user.rows.length === 0) return res.status(401).json({ error: "User is not registered" , userID: userID});

    const userPass = user.rows[0].password

    try {
        const passwords = await pool.query(
            `SELECT p.*, c.id AS category_id, c.category_name
             FROM passwords p
             LEFT JOIN password_categories pc ON p.id = pc.password_id
             LEFT JOIN categories c ON pc.category_id = c.id
             WHERE p.user_id = $1`, [userID]
        );

        // Group passwords by password id and collect categories into an array
        const groupedPasswords = passwords.rows.reduce((acc, row) => {
            const { id, service_name, link, login, password, logo, category_id, category_name, score } = row;
            if (!acc[id]) {
                const salt = password.slice(0, 32); // Extract salt from the encrypted password
                const iv = password.slice(-32); // Extract IV from the encrypted password
                const encryptedData = password.slice(32, -32); // Extract encrypted data
                const decryptedPass = decryptPassword(encryptedData, salt, iv, userPass);
                acc[id] = { id, service_name, link, login, decryptedPass, logo, categories: [], score };
            }
            if (category_id) {
                acc[id].categories.push({ category_id, category_name });
            }
            return acc;
        }, {});

        res.json(Object.values(groupedPasswords));
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ error: error });
    }
}




const addPassword = async (req, res) => {
    console.log("BODY:", req.body);
    const data = req.body;

    const token = req.cookies.jwt;
    const userID = decodeJWT(token)

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [userID]);
    if (user.rows.length === 0) return res.status(401).json({ error: "User is not registered" });

    const userPass = user.rows[0].password

    const encrtptedPass = encryptPassword(data.password, userPass)

    const score = passwordStrength(data.password);

    try {

        const passwordInsertResult = await pool.query(
            "INSERT INTO passwords (service_name, link, login, password, logo, score, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [data.website, data.webLink, data.login, encrtptedPass, (data.logo).toLowerCase(), Math.round(score), userID]
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


const deletePassword = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("delete a post request hasarrived");
        const deletepost = await pool.query(
            "DELETE FROM passwords WHERE id = $1", [id]
        );
        res.json(deletepost);
    } catch (err) {
        console.error(err.message);
    }
}

const updatePassword = async (req, res) => {
    const { id } = req.params; // Assuming id is passed in the URL parameters
    const data = req.body;

    const token = req.cookies.jwt;
    const userID = decodeJWT(token);

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [userID]);
    if (user.rows.length === 0) return res.status(401).json({ error: "User is not registered" });

    const userPass = user.rows[0].password

    const encrtptedPass = encryptPassword(data.password, userPass)

    const score = passwordStrength(data.password);

    try {
        // Check if the password belongs to the user before updating
        const password = await pool.query("SELECT * FROM passwords WHERE id = $1 AND user_id = $2", [id, userID]);
        if (password.rows.length === 0) return res.status(404).json({ error: "Password not found or does not belong to the user" });

        // Update the password fields
        const updateResult = await pool.query(
            "UPDATE passwords SET service_name = $1, link = $2, login = $3, password = $4, logo = $5, score = $6 WHERE id = $7",
            [data.website, data.webLink, data.login, encrtptedPass, (data.logo).toLowerCase(), Math.round(score), id]
        );

        // Handle categories update if needed
        if (data.categories && data.categories.length > 0) {
            // Delete existing associations
            await pool.query("DELETE FROM password_categories WHERE password_id = $1", [id]);

            // Insert new associations
            for (const categoryName of data.categories) {
                const categoryQueryResult = await pool.query(
                    "SELECT id FROM categories WHERE category_name = $1",
                    [categoryName.category_name]
                );

                const categoryID = categoryQueryResult.rows[0].id;

                await pool.query(
                    "INSERT INTO password_categories (password_id, category_id) VALUES ($1, $2)",
                    [id, categoryID]
                );
            }
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



module.exports = {
    getPasswords,
    addPassword,
    deletePassword,
    updatePassword
};
