const fs = require('fs');
const express = require("express");
const router = express.Router()
const auth = require("../middlewares/jwt")
const ApiError = require('../utils/ApiError');
const nodemailer = require("nodemailer");
var multer = require('multer')
require("dotenv").config();

let upload = multer("/")
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.verify().then(console.log).catch(console.error);

async function sendMails(emails,data) {
  let responses = [];
  let mails = [];
  let i = 0;
  const path = "../uploads/";
  const filenames=await fs.readdir(path);
  const files=filenames.map(filename => fs.readFile(path + filename));
  const attachments=files.map(file => {
    return {filename: file.originalname, content: file.buffer} 
  });
  const from=process.env.SMTP_FROM;
  mails = emails.map(to => transporter.sendMail({from,to,subject:data[i].subject,html:data[i].body,attachments}));
  responses = await Promise.all(mails);
  return responses.length;
}


router.use(auth.checkToken);

router.get("/", async (req, res) => {
  res.status(200).send("hello");
});

router.post("/",upload.none(), async (req, res, next) => {
  const {emails,data}=req.body;
  try {
    const i = await sendMails(emails,data);
    res.status(201).json(i + " Mails Have Been Sent Successfully");
  } catch (e) {
    next(e);
  }
});

router.post("/attachments", upload.array("files"), async (req, res, next) => {
  try {
    res.status(201).json(req.files.length + "Files have been saved successfully");
  } catch (e) {
    next(e);
  }
});

module.exports = router;