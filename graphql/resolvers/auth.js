
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async args => {
        try {
            const existinguser = await User.findOne({ email: args.userInput.email })
            if (existinguser) {
                throw new Error('User exists already.');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return { ...result._doc, password: null, _id: result.id };
        } catch (err) {
            throw err;
        };
    },
    login: async ({ email, password }) => {
        const user = await User.findOne({ email: email });
        console.log('user', user);
        if (!user) {
            throw new Error('User doesn not exists!');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('Password is incorrect!');
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, 'pass1234@2019', {
            expiresIn: '1h'
        });
        return { userId: user.id, token: token, tokenExpiration: 1 };
    }
};