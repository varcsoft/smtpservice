const express = require('express');
const errorHandler = require('./middlewares/error');
const smtpRoutes = require("./routes/smtp.routes");
require("dotenv").config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());

app.use(express.static('uploads'));
app.use("/smtp", smtpRoutes);

app.use((req, res, next) => {
  next(Error('Not found'));
});
app.use(errorHandler);

let server;
let PORT = process.env.PORT || 5000;
server = app.listen(PORT, () => console.log(`Listening to port ${PORT}`));

exitHandler = () => {
  if (server) {
    server.close(() => {
        console.log('Server closed');
        process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
    console.log(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});