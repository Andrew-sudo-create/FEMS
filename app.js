require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request= require("request");
const https = require("https");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
var validator = require("email-validator");
const app = express();
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
  res.render("home");
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
  newContact.save(function(err){
    if(err){
      res.redirect("/failure")
    }else{
      res.redirect("/success")
    }
  })
})

app.listen(3000,function(){

})
