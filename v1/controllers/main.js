const sql = require('../../model/entity');
const nodemailer = require('nodemailer');
require('dotenv').config();

var transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
});

exports.getNotFound = function (req, res,next){
    res.status(404).send();
}

exports.getHelloWorld = function (req, res,next){
    res.status(200).send('Hello World');
}

exports.getAllVolunteers = async function (req, res,next){
    let volunteerList = [];
    volunteerList = await sql.getAllVolunteers();
    if(volunteerList.length > 0){
        res.status(200).json({status:200, results: volunteerList, resultsLength: volunteerList.length});
    }else{
        res.status(204).send();
    }
}

exports.getVolunteerByUserNameAndPassword = async function (req, res,next){
    let volunteerList = [];
    volunteerList = await sql.getVolunteerByUserNameAndPassword(req.params.userName,req.params.password);
    if(volunteerList.length > 0){
        res.status(200).json({status:200, results: volunteerList, resultsLength: volunteerList.length});
    }else{
        res.status(204).send();
    }
}

exports.createNewVolunteer = async function (req, res,next){
  let rowCount = sql.createNewVolunteer(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({userCreated: true});
  }else{
    res.status(202).send();
  }
}

exports.getAllVolunteersByStatus = async function (req, res,next){
  let volunteerList = [];
  volunteerList = await sql.getAllVolunteersByStatus(req.params.status);
  if(volunteerList.length > 0){
      res.status(200).json({status:200, results: volunteerList, resultsLength: volunteerList.length});
  }else{
      res.status(204).send();
  }
}

exports.getAllVolunteersBySearchValue = async function (req, res,next){
  let volunteerList = [];
  volunteerList = await sql.getAllVolunteersBySearchValue(req.params.searchValue);
  if(volunteerList.length > 0){
      res.status(200).json({status:200, results: volunteerList, resultsLength: volunteerList.length});
  }else{
      res.status(204).send();
  }
}

exports.getVolunteerById = async function (req, res,next){
    let volunteerList = [];
    volunteerList = await sql.getVolunteerById(req.params.volunteerId);
    if(volunteerList.length > 0){
        res.status(200).json({status:200, results: volunteerList, resultsLength: volunteerList.length});
    }else{
        res.status(204).send();
    }
}

exports.updateVolunteer = async function (req, res,next){
    let rowCount = sql.updateVolunteer(req.body);
    console.log(rowCount);
    if(rowCount == 1){
      res.status(201).json({userUpdated: true});
    }else{
      res.status(202).send();
    }
}

exports.changeVolunteerPassword = async function (req, res,next){
    let rowCount = await sql.changeVolunteerPassword(req.params.passwordHash, req.params.volunteerId);
    if(rowCount == 1){
        res.status(201).json({userUpdated: true});
    }else{
        res.status(204).send();
    }
}

exports.getVolunteerByEmail = async function (req, res,next){
    let volunteerList = [];
    volunteerList = await sql.getVolunteerByEmail(req.params.volunteerEmail);
    if(volunteerList.length > 0){
        res.status(200).json({status:200, results: volunteerList, resultsLength: volunteerList.length});
    }else{
        res.status(204).json();
    }
}

exports.getAllEducations = async function (req, res,next){
    let educationList = [];
    educationList = await sql.getAllEducations();
    if(educationList.length > 0){
        res.status(200).json({status:200, results: educationList, resultsLength: educationList.length});
    }else{
        res.status(204).json();
    }
}

exports.getAllRoles = async function (req, res,next){
    let roleList = [];
    roleList = await sql.getAllRoles();
    if(roleList.length > 0){
        res.status(200).json({status:200, results: roleList, resultsLength: roleList.length});
    }else{
        res.status(204).json();
    }
}