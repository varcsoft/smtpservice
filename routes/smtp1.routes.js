const express = require("express");
const router = express.Router()
const auth = require("../middlewares/jwt")
const ApiError = require('../utils/ApiError');
const nodemailer = require("nodemailer");
var multer  = require('multer')
require("dotenv").config();

let upload = multer()

async function sendMails(emails, subject, body, files) {
  let responses=[];
  let mails=[];
  let emailsarray;
  let i=0;
  let mailLimit=10;
  emails = JSON.parse(emails);
  const path = "C:/Users/rohit/Desktop/shiva/mern/important/smtp_service/uploads/";
  const emailsLength = emails.length;
  while(i<emailsLength){
    emailsarray = emails.slice(i, i + mailLimit);
    mails=emailsarray.map(email => transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: subject + i,
      html: '<p><h1>Dear Shiva, </h1></p><p>Congratulations on completing our course <p>Click <a href="http://localhost:5000/certificate.html">here</a> to download your certificate</p>',
      attachments: [{ filename: files[i].originalname, content: files[i++].buffer }]
    }));
    responses=responses.concat(await Promise.all(mails));
  }
  console.log(responses);
  return responses.length;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
  }
});
transporter.verify().then(console.log).catch(console.error);

router.use(auth.checkToken);

router.get("/", upload.array("files"), async (req, res) => {
  res.status(200).send("hello");
});

router.post("/", upload.array("files"), async (req, res, next) => {
  let {emails,subject,body}=req.body;
  const files=req.files;
  try {
    const i = await sendMails(emails, subject, body, files);
    res.status(201).json(i +" Mails Have Been Sent Successfully");
  } catch (e) {
    next(e);
  }
});

module.exports = router;