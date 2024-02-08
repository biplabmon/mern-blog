import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";


export const signup = async (req, res, next) => {
    console.log("body value", req.body);

    const { username, password, email } = req.body;

    if (!username 
        || !password 
        || !email 
        || username === '' 
        || username === '' 
        || email === '') {
        next(errorHandler(400, "All fields are required"));
    };

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
        username,
        password: hashedPassword,
        email
    });

    try {
        await newUser.save();
        return res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        next(error);
    };
};