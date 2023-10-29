const fs = require('fs');
const express = require("express");
const router = express.Router()
const auth = require("../middlewares/jwt")
const ApiError = require('../utils/ApiError');
const nodemailer = require("nodemailer");
var multer = require('multer')
require("dotenv").config();

let upload = multer({ dest: "uploads/" })
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.verify().then(console.log).catch(console.error);

async function sendMails(emails, data) {
  let responses = [];
  let mails = [];
  let i = 0;
  const path = "uploads/";
  const filenames = fs.readdirSync(path);
  const files = filenames.map(filename => fs.readFileSync(path + filename));
  const attachments = files.map(file => {
    return { filename: filenames[i++], content: file }
  });
  const from = process.env.SMTP_FROM;
  i = 0;
  mails = emails.map(to => transporter.sendMail({ from, to, subject: data[i].subject, html: data[i].body, attachments }));
  responses = await Promise.all(mails);
  return responses.length;
}


router.use(auth.checkToken);

router.get("/", upload.none(), async (req, res) => {
  res.status(200).send("hello");
});

router.post("/", upload.none(), async (req, res, next) => {
  const { emails, data } = req.body;
  if (!emails || !data) {
    res.status(201).json("Please provide mail data");
  }
  try {
    const i = await sendMails(emails, data);
    res.status(201).json(i + " Mails Have Been Sent Successfully");
  } catch (e) {
    next(e);
  }
});

router.post("/attachments", upload.array("files"), async (req, res, next) => {
  try {
    res.status(201).json(req.files.length + " Files have been saved successfully");
  } catch (e) {
    next(e);
  }
});

module.exports = router;