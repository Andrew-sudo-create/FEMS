require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request= require("request");
const https = require("https");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
var validator = require("email-validator");
const fetch = require("isomorphic-fetch");
const app = express();
const starterAboutP1 = "We started Facilities & Estate Management Solutions (Pty) Ltd out of a need that we recognized in the market place to make the lives of Trustee’s easier. We as owners of the business have a collective 32 years of experience in this market and we know that the job of a Trustee is a thankless one, it is purely voluntary and in most instances they do not have the time they would like to spend on the affairs of the body corporate due to their family,"
const starterAboutP2 = " work or other obligations. So as professional Estate & Facility managers we saw the need to provide the body corporates with a professional, pro-active & dedicated service offering, which would take the load off their shoulders and give them piece of mind, as well as being able to report back to fellow owners that their investments are in very capable hands."
const starterAboutP3 = "During our market research we found that a good deal of the service providers in this space received mediocre reviews and it mostly revolved around dissatisfaction with service that was promised but not provided or their complaints were not satisfactorily resolved. As a future client of Facilities & Estate Management Solutions (Pty) Ltd you shall receive the service you desire and more. Our clients are one of the most important aspects of the business and it is very important to us that the service we promise, is delivered in a professional manner, with integrity while providing a reliable service based on value for money, giving you piece of mind";

mongoose.connect(process.env.ATLAS_URL,{useNewUrlParser: true,useUnifiedTopology: true })

const contactSchema = new mongoose.Schema({
  contactFirstName:String,
  contactLastName:String,
  contactEMail:String,
  contactPhone:Number,
  contactMessage:String
})

const ContactPerson = mongoose.model("ContactPerson",contactSchema);

const reviewSchema = new mongoose.Schema({
  reviewFirstName : String,
  reviewLastName : String,
  reviewPersonTitle : String,
  reviewMessage : String
})

const Review = mongoose.model("Review",reviewSchema);

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs")

app.get("/",function(req,res){
  res.render("home",{starterAboutP1:starterAboutP1,
                     starterAboutP2:starterAboutP2,
                     starterAboutP3:starterAboutP3});
})

app.get("/about",function(req,res){
  res.render("about")
})

app.get("/services",function(req,res){
  res.render("services")
})

app.get("/addreview",function(req,res){
  res.render("addreview")
})

app.get("/success",function(req,res){
  res.render("success")
})

app.get("/failure",function(req,res){
  res.render("failure")
})
app.get("/privacy",function(req,res){
  res.render("privacy")
})
app.get("/TsandCs",function(req,res){
  res.render("TsandCs")
})


app.post("/addreview",function(req,res){

    const firstNameReview = req.body.fNameReview;
    const lastNameReview = req.body.lNameReview;
    const titleNameReview = req.body.titleNameReview;
    const review_text = req.body.reviewText;

    const newReview = new Review({
      reviewFirstName:firstNameReview,
      reviewLastName:lastNameReview,
      reviewPersonTitle:titleNameReview,
      reviewMessage:review_text
    })

    newReview.save(function(err){
      if(err){
        res.redirect("/failure")
      }else{
        res.redirect("/success")
      }
    });
  })

app.post("/send",function(req,res){
  //Contact Form
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const eMail = req.body.eMail;
  const phone = req.body.phone;
  const message = req.body.message;

//NodeMailer
const output = `
<h1>Contact Request Information</h1>
<p>Respond to this contact using the following information:</p>
<ul>
  <li>First Name:${firstName}</li>
  <li>Last Name:${lastName}</li>
  <li>Phone Number:${phone}</li>
  <li>E-Mail:${eMail}</li>
</ul>
<h3>Message:</h3>
<p>${message}</p>`;

const nodemailer = require("nodemailer");

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "mail.femsolutions.co.za",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NODE_USER,
      pass: process.env.NODE_PASS
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // send mail with defined transport object
  let mailOptions = {
    from: '"Website" <webdev@femsolutions.co.za>', // sender address
    to: "info@femsolutions.co.za", // list of receivers
    subject: "Contact Request From Website", // Subject line
    text: "Contact", // plain text body
    html: output // html body
  };

  transporter.sendMail(mailOptions,(error,info)=>{
    if(error){
      return console.log(error);
    }
  })

//Database Schema
  const newContact = new ContactPerson({
    contactFirstName: firstName,
    contactLastName: lastName,
    contactEMail: eMail,
    contactPhone:phone,
    contactMessage:message
  });

  const data = {
    members:[
      {
        email_address:eMail,
        status:"subscribed",
        merge_fields:{
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  const jsonData = JSON.stringify(data);

  const url = process.env.MAILCHIMP_URL

  const options={
    method: "POST",
    auth: process.env.MAILCHIMP_API
  }
  const request = https.request(url,options,function(response){
    response.on("data",function(data){
    })
  })

  request.write(jsonData);
  request.end();

  // newContact.save(function(err){
  //   if(err){
  //     res.redirect("/failure")
  //   }else{
  //     res.redirect("/success")
  //   }
  // })

//Site key 6Lc33W0dAAAAAKzx1Msi-pThYBWfs17519o5F2Dk
//Secret Key 6Lc33W0dAAAAAF-eMW5iOEtQnZHQQ2Qm3M41BrMs

const name = req.body.name;
// getting site key from client side
const response_key = req.body["g-recaptcha-response"];
// Put secret key here, which we get from google console
const secret_key = process.env.SECRET_KEY;

// Hitting POST request to the URL, Google will
// respond with success or error scenario.
const captchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

// Making POST request to verify captcha
fetch(captchaUrl, {
  method: "post",
})
  .then((response) => response.json())
  .then((google_response) => {

    // google_response is the object return by
    // google as a response
    if (google_response.success == true) {
      //   if captcha is verified
      newContact.save();
      return res.redirect("/success")
    } else {
      // if captcha is not verified
      return res.redirect("/failure")
    }
  })
  .catch((error) => {
      // Some error while verify captcha
    return res.redirect("/failure");
  });

});








app.listen(3000,function(){
  console.log("Server is running on port 3000");
})
