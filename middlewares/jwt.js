const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();
const TOKEN = process.env.SENDEMAILTOKEN;
const TOKENNOTVALID = 'Token is not valid';
const AUTHTOKENNOTSUPPLIED = 'Auth token is not supplied';
let checkToken = (req, res, next) => {
    let token = req.headers['authorization'] || req.headers['Authorization'];
    if (token) {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
            jwt.verify(token, process.env.SECRET, (err, decoded) => {
                if (err) {
                    console.log(err);                    
                    res.status(500).json({message: TOKENNOTVALID});
                } else {
                    if(decoded==process.env.SENDEMAILTOKEN){
                        next();
                    } else {
                        res.status(500).json({message: TOKENNOTVALID});
                    }
                }
            });
        }
    }
    else{
        res.status(500).json({message: AUTHTOKENNOTSUPPLIED});
    }
};

module.exports = {checkToken: checkToken}