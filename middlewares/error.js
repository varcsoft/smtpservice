const {logerror} = require("../utils/utils.js");

const errorHandler = (err, req, res, next) => {
    let { statusCode, message, isOperational } = err;
    message = isOperational ? message : "Error occurred while sending mail";
    statusCode = statusCode ? statusCode : 500;
    logerror(statusCode, message, err);
    res.status(statusCode).json({ message: message, data: message });
};

module.exports = errorHandler;