import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";


export const signup = async (req, res, next) => {
    console.log("body value", req.body);

    const { username, password, email } = req.body;

    if (!username
        || !password
        || !email
        || username === ''
        || username === ''
        || email === '') {
       return next(errorHandler(400, "All fields are required"));
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


export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
        return next(errorHandler(400, "All fields are required"));
    };

    try {
        const validUser = await User.findOne({ email: email });
        if (!validUser) {
            return next(errorHandler(401, 'Invalid credentials'));
        };

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(401, 'Invalid credentials'));
        };

        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET_KEY);

        const {password: pass, ...rest} = validUser._doc;       // to avoid returning password

        res.status(200).cookie('access_token', token, { httpOnly: true }).json(rest);

    } catch (error) {
        next(error);
    }
};