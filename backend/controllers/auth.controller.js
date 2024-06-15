import { generateTokenAndSetCookies } from "../lib/utils/generateToken.js";
import User from "../model/user.models.js";
import bcrypt from 'bcryptjs';

export const signup = async(req, res) => {
    try {
        const {fullName, username, email, password} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(401).json('Email is not valid')
        }

        const existingUser = await User.findOne({username})
        if (existingUser) {
            return res.status(401).json('Username is already taken')
        }
        const existinEmail = await User.findOne({email})
        if (existinEmail) {
            return res.status(401).json('Email is already taken')
        }
    
        if (password.length < 6) {
            return res.status(401).json('Password should be at least 6 characters long')
        }
        // hash the password

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            username,
            email,
            password: passwordHash
        })

       if(newUser){
            generateTokenAndSetCookies(newUser._id, res)
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImage: newUser.profileImage,
                coverImage: newUser.coverImage,
            })
       }else{
              res.status(400).json('Invalid user data')
       }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}

export const login = async(req, res) => {
    try {
        const {username, password} = req.body
        const user = await User.findOne({username})
        if (!user) {
            return res.status(401).json('Invalid credentials')
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password || '');
     

        if (!isPasswordCorrect || !user) {
            return res.status(401).json('Invalid credentials')
        }

        generateTokenAndSetCookies(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
        })


    } catch (error) {
        console.log("Error in login", error.message)
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}

export const logout = (req, res) => {
    try {
		res.cookie("token", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export const getMe = async(req, res) => {
       // get user data from token
       try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json('User not found')
        }
        res.status(200).json(user)
    }
    catch (error) {
        console.log("Error in getMe controllers", error.message);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}