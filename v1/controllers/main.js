const sql = require('../../model/entity');

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

exports.getAllBusinesses = async function (req, res,next){
    let businessesArray = [];
   businessesArray = await sql.getAllBusinesses();
    if(businessesArray.length > 0){
        res.status(200).json({status:200, results:businessesArray, resultsLength:businessesArray.length});
    }else{
        res.status(204).send();
    }
}

<<<<<<< Updated upstream
exports.createNewBusiness = async function (req, res,next){
  let rowCount = JSON.stringify(sql.createNewBusiness(req.body));
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({businessObject: true});
  }else{
    res.status(202).send();
  }
}
=======
exports.getVolunteerByEmail = async function (req, res,next){
    let volunteerList = [];
    volunteerList = await sql.getVolunteerByEmail(req.params.volunteerEmail);
    if(volunteerList.length > 0){
        res.status(200).json({status:200, results: volunteerList, resultsLength: volunteerList.length});
    }else{
        res.status(204).json();
    }
}

exports.getVolunteerByUsername = async function (req, res,next){
    let volunteerList = [];
    volunteerList = await sql.getVolunteerByUsername(req.params.username);
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

exports.getAllBusinesses = async function (req,res,next){
    let BusinessList = [];
    BusinessList = await sql.getAllBusinesses();
    if(BusinessList.length > 0){
        res.status(200).json({status:200, results: BusinessList, resultsLength: BusinessList.length});
    }else{
        res.status(204).json();
    }
}

exports.createNewBusiness = async function (req, res,next){
    let rowCount = sql.createNewBusiness(req.body);
    console.log(rowCount);
    if(rowCount == 1){
      res.status(201).json({businessObject: true});
    }else{
      res.status(202).send();
    }
  }
>>>>>>> Stashed changes
