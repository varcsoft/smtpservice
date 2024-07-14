const logger = require('./logger.js');

const logdata = (message) => {
    logger.info(new Date().toISOString() +" -> "+message);
};

const logerror = (status, message, err) => {
    logger.error(new Date().toISOString() +" -> Status:"+status+" "+err);
};

const sendresponse = (res, status, message) => {
    logdata("response: status :"+status+" data:" + JSON.stringify(message));
    res.status(status).json({ message: "success", data: message });
}
module.exports = { logdata, logerror, sendresponse };