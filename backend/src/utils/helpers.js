const generateToken = require('jsonwebtoken').sign;

const createToken = (id) => {
    return generateToken({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { createToken };
