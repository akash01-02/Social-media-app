const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json('User with this email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        const user = await newUser.save();
        const { password, ...userWithoutPassword } = user._doc;
        res.status(201).json(userWithoutPassword);
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json(err.message || 'Error creating user');
    }
});

router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt for email:', req.body.email);
        
        if (!req.body.email || !req.body.password) {
            return res.status(400).json('Email and password are required');
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            console.log('User not found for email:', req.body.email);
            return res.status(404).json('User not found');
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            console.log('Invalid password for email:', req.body.email);
            return res.status(400).json('Wrong password');
        }

        const { password, ...userWithoutPassword } = user._doc;
        console.log('Login successful for email:', req.body.email);
        res.status(200).json(userWithoutPassword);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json(err.message || 'Error during login');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json('User not found');
        }
        const { password, ...userWithoutPassword } = user._doc;
        res.status(200).json(userWithoutPassword);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/', async (req, res) => {
    const username = req.query.username;
    try {
        const user = username 
            ? await User.findOne({ username: username })
            : await User.findById(req.query.userId);
            
        if (!user) {
            return res.status(404).json('User not found');
        }
        
        const { password, ...userWithoutPassword } = user._doc;
        res.status(200).json(userWithoutPassword);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json(err);
    }
});

router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            const updateFields = {};
            const allowedFields = ['city', 'from', 'relationship', 'desc', 'profilePicture', 'coverPicture'];
            
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateFields[field] = req.body[field];
                }
            });

            const user = await User.findByIdAndUpdate(
                req.params.id,
                { $set: updateFields },
                { new: true }
            );

            if (!user) {
                return res.status(404).json('User not found');
            }

            const { password, ...userWithoutPassword } = user._doc;
            res.status(200).json(userWithoutPassword);
        } catch (err) {
            console.error('Error updating user:', err);
            res.status(500).json(err.message || 'Error updating user information');
        }
    } else {
        return res.status(403).json('You can update only your account!');
    }
});

router.put('/:id/follow', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        
        if (!user.followers.includes(req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId }});
            await currentUser.updateOne({ $push: { following: req.params.id }});
            res.status(200).json('User has been followed');
        } else {
            res.status(403).json('You already follow this user');
        }
    } catch (err) {
        console.error('Follow user error:', err);
        res.status(500).json(err.message || 'Error following user');
    }
});

module.exports = router;
