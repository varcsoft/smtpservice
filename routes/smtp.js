const fs = require('fs');
const express = require("express");
const router = express.Router()
const auth = require("../middlewares/jwt")
const ApiError = require('../utils/ApiError');
const nodemailer = require("nodemailer");
var multer = require('multer');
const { logdata, sendresponse } = require('../utils/utils');

require("dotenv").config();
const path = "uploads/";
const upload = multer({ dest: path });
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.verify().then(logdata).catch(console.error);

const sendmail = async (data) => {
  const { from, to, cc, bcc, subject, body } = data;
  if (!from || (!to && !cc && !bcc) || !subject || !body) {
    throw new ApiError(400, "Please provide from, to, cc, bcc, subject and body");
  }
  const info = await transporter.sendMail({ from, to, cc, bcc, subject, html: body });
  return info;
}
  
router.get("/", async (req, res) => {
  sendresponse(res,200,("SMTP Service is running..."));
});

router.post("/send", async (req, res, next) => {
  try{
    const response = await sendmail(req.body);
    sendresponse(res,201,"Mail has been sent successfully");
  } catch (e) {
    next(e);
  }
});

router.post("/send/attachment", upload.array("attachments"), async (req, res, next) => {
  const { from, to, cc, bcc, subject, body } = req.body;
  if (!from || (!to && !cc && !bcc) || !subject || !body) {
    throw new ApiError(400, "Please provide from, to, cc, bcc, subject and body");
  }
  try {
    const filenames = fs.readdirSync(path);
    const files = filenames.map(filename => fs.readFileSync(path + filename));
    const attachments = files.map(file => {
      return { filename: filenames[i++], content: file }
    });
    const info = await transporter.sendMail({ from, to, cc, bcc, subject, html: body, attachments });
    sendresponse(res,201,"Mail has been sent successfully");
  } catch (e) {
    next(e);
  }
});

router.post("/send/multiple", async (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    throw new ApiError(400, "Please provide mail data");
  }
  try {
    const responses = data.map(mail => {
      return sendmail(mail);
    });
    const result = await Promise.all(responses);
    sendresponse(res,201,"Mails have been sent successfully");
  } catch (e) {
    next(e);
  }
});

router.post("/attachment", upload.array("attachments"), async (req, res, next) => {
  try {
    sendresponse(res,201,req.files.length + " Files have been saved successfully");
  } catch (e) {
    next(e);
  }
});

module.exports = router;
