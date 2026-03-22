const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* Signup */
exports.signup = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, salt);
        const existingUser = await User.findOne({ email });


        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ message: "User created successfully" });

    } catch (err) {
  console.error("SIGNUP ERROR:", err);
  res.status(500).json({
    message: err.message || "Server error"
  });
}
};


/* Login */
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};