const sql = require('../../model/entity');
const nodemailer = require('nodemailer');
require('dotenv').config();
const fs = require('fs');
const path = require('path')
const stream = require('stream')

exports.getNotFound = function (req, res, next) {
    res.status(404).send();
};

exports.getHelloWorld = function (req, res, next) {
    res.status(200).send("Hello World");
};

exports.getAllVolunteers = async function (req, res, next) {
    let volunteerList = [];
    volunteerList = await sql.getAllVolunteers();
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};


exports.getAllFamily = async function (req, res,next){
    let familyList = [];
    familyList = await sql.getAllFamily();
    if(familyList.length > 0){
        res.status(200).json({status:200, results: familyList, resultsLength: familyList.length});
    }else{
        res.status(204).json();
    }
}

exports.getVolunteerByUserNameAndPassword = async function (req, res,next){
    let volunteerList = [];
    volunteerList = await sql.getVolunteerByUserNameAndPassword(req.params.userName, req.params.password);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};

exports.getCurrentUser = async function (req, res,next){
    let volunteerList = [];
    console.log(req.params.username);
    volunteerList = await sql.getCurrentUser(req.params.username);
    console.log(volunteerList);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};



exports.createNewVolunteer = async function (req, res, next) {
    let rowCount = sql.createNewVolunteer(req.body);
    console.log(rowCount);
    if (rowCount == 1) {
        res.status(201).json({userCreated: true});
    } else {
        res.status(202).send();
    }
};

exports.getAllVolunteersByStatus = async function (req, res, next) {
    let volunteerList = [];
    volunteerList = await sql.getAllVolunteersByStatus(req.params.status);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};

exports.getVolunteerByUsername = async function (req, res, next) {
    let volunteerList = [];
    volunteerList = await sql.getVolunteerByUsername(req.params.status);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};

exports.getAllVolunteersBySearchValue = async function (req, res, next) {
    let volunteerList = [];
    volunteerList = await sql.getAllVolunteersBySearchValue(req.params.searchValue);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};

exports.getCurrentUser = async function (req, res,next){
    let volunteerList = [];
    console.log(req.params.username);
    volunteerList = await sql.getCurrentUser(req.params.username);
    console.log(volunteerList);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};



exports.createNewVolunteer = async function (req, res, next) {
    let rowCount = sql.createNewVolunteer(req.body);
    console.log(rowCount);
    if (rowCount == 1) {
        res.status(201).json({userCreated: true});
    } else {
        res.status(202).send();
    }
};

exports.createNewFamily = async function (req, res, next) {
    let rowCount = sql.createNewFamily(req.body);
    console.log(rowCount);
    if (rowCount == 1) {
        res.status(201).json({familyCreated: true});
    } else {
        res.status(202).send();
    }
};

exports.getAllVolunteersByStatus = async function (req, res, next) {
    let volunteerList = [];
    volunteerList = await sql.getAllVolunteersByStatus(req.params.status);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};

exports.getVolunteerByUsername = async function (req, res, next) {
    let volunteerList = [];
    volunteerList = await sql.getVolunteerByUsername(req.params.status);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};

exports.getAllVolunteersBySearchValue = async function (req, res, next) {
    let volunteerList = [];
    volunteerList = await sql.getAllVolunteersBySearchValue(req.params.searchValue);
    if (volunteerList.length > 0) {
        res.status(200).json({status: 200, results: volunteerList, resultsLength: volunteerList.length});
    } else {
        res.status(204).send();
    }
};

exports.getAllBusinesses = async function (req, res, next) {
    let businessesArray = [];
    businessesArray = await sql.getAllBusinesses();
    if (businessesArray.length > 0) {
        res.status(200).json({status: 200, results: businessesArray, resultsLength: businessesArray.length});
    } else {
        res.status(204).send();
    }
};

exports.getBusinessById = async function (req, res,next){
  let businessList = [];
  businessList = await sql.getBusinessById(req.params.businessId);
  if(businessList.length > 0){
      res.status(200).json({status:200, results: businessList, resultsLength: businessList.length});
  }else{
      res.status(204).send();
  }
}

exports.getAllCategories = async function (req, res, next) {
  let categoryList = [];
  categoryList = await sql.getAllCategories();
  if (categoryList.length > 0) {
      console.log(categoryList)
      res.status(200).json({status: 200, results: categoryList, resultsLength: categoryList.length});
  } else {
      res.status(204).send();
  }
};

exports.createNewBusiness = async function (req, res, next) {
    let rowCount = sql.createNewBusiness(req.body);
    console.log(rowCount);
    if (rowCount == 1) {
        res.status(201).json({businessCreated: true});
    } else {
        res.status(202).send();
    }
};


exports.updateBusiness = async function (req, res,next){
  let rowCount = sql.updateBusiness(req.body);
  if(rowCount == 1){
    res.status(201).json({businessUpdated: true});
  }else{
    res.status(202).send();
  }
}

exports.getActiveBusinesses = async function (req, res,next){
  let businessList = [];
  businessList = await sql.getActiveBusinesses();
  if(businessList.length > 0){
      res.status(200).json({status:200, results: businessList, resultsLength: businessList.length});
  }else{
      res.status(204).send();
  }
}


exports.getAllBudgets = async function (req, res, next) {
    let budgetArray = [];
    budgetArray = await sql.getAllBudgets();
    if (budgetArray.length > 0) {
        res.status(200).json({status: 200, results: budgetArray, resultsLength: budgetArray.length});
    } else {
        res.status(204).send();
    }
};

exports.createNewBudget = async function(req,res,next){
    let rowCount = sql.createNewBudget(req.body);
    console.log(rowCount);
    if (rowCount == 1) {
        res.status(201).json({budgetCreated: true});
    } else {
        res.status(202).send();
    }
};

exports.getAllBudgets = async function (req, res, next) {
    let budgetArray = [];
    budgetArray = await sql.getAllBudgets();
    if (budgetArray.length > 0) {
        res.status(200).json({status: 200, results: budgetArray, resultsLength: budgetArray.length});
    } else {
        res.status(204).send();
    }
};

exports.createNewBudget = async function(req,res,next){
    let rowCount = sql.createNewBudget(req.body);
    console.log(rowCount);
    if (rowCount == 1) {
        res.status(201).json({budgetCreated: true});
    } else {
        res.status(202).send();
    }
};

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
    if(rowCount == 1){
      res.status(201).json({userUpdated: true});
    }else{
      res.status(202).send();
    }
}

exports.updateProfilePicture = async function (req, res,next){
    //let rowCount = sql.updateVolunteer(req.body);
    //console.log(req.file);
    var fileExtension = path.extname('uploads/'+req.file.originalname);
    var newFileName = 'uploads/'+req.params.username + fileExtension;
    fs.rename('uploads/'+req.file.originalname, newFileName, function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });

    sql.tp.sql(`exec [usp_updateProfilePictureURLByUsername] ${req.params.username}, '${newFileName}'`)
        .returnRowCount()
        .execute()
        .then(function(rowCount) {
            if(rowCount > 0){
                res.status(201).json({userUpdated: true});
            }
        }).fail(function(err) {
            console.log(err);
            res.status(409).json({status: 409, errorMessage: `Error saving to database: ${err}`});
        });
}

exports.getProfilePicture = async function (req, res,next){
    sql.tp.sql(`exec [usp_getProfilePictureURL] '${req.params.username}'`)
    .execute()
    .then(function(results) {
        if(results){
            const r = fs.createReadStream(results[0].URL) 
            const ps = new stream.PassThrough()
            stream.pipeline(
            r,
            ps, 
            (err) => {
                if (err) {
                console.log(err)
                    return res.status(400).json({status: 409, errorMessage: `Error getting image: ${err}`}); 
                }
            })
            ps.pipe(res)
            //res.status(201).json({status: 201, successMessage: `Profile URL is ${results[0].URL}`});
        }
       }).fail(function(err) {
           console.log(err);
           res.status(409).json({status: 409, errorMessage: `Error saving to database: ${err}`});
       });
} 

exports.saveLoginHistory = async function (req, res,next){
    sql.tp.sql(`exec [usp_insertLoginHistory] ${req.body.userId}, '${req.body.date}' , '${req.body.time}', '${req.body.clientIp}'`)
        .returnRowCount()
        .execute()
        .then(function(rowCount) {
            if(rowCount > 0){
                res.status(201).json({sessionSaved: true});
            }
        }).fail(function(err) {
            console.log(err);
            res.status(409).json({status: 409, errorMessage: `Error saving to database: ${err}`});
        });
}

exports.getLoginHistory = async function (req, res,next){
    sql.tp.sql(`exec [dbo].[usp_getLoginHistory] ${req.params.userId}`)
        .execute()
        .then(function(results) {
            if(results.length > 0){
                res.status(200).json({ status: 200, results: results, resultsLength: results.length});
            }
        }).fail(function(err) {
            console.log(err);
            res.status(409).json({status: 409, errorMessage: `Error saving to database: ${err}`});
        });
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

exports.getAllServices = async function (req, res,next){
  let serviceList = [];
  serviceList = await sql.getAllServices();
  if(serviceList.length > 0){
      res.status(200).json({status:200, results: serviceList, resultsLength: serviceList.length});
  }else{
      res.status(204).send();
  }
}

exports.getAllCategories = async function (req, res,next){
  let categoryList = [];
  categoryList = await sql.getAllCategories();
  if(categoryList.length > 0){
      res.status(200).json({status:200, results: categoryList, resultsLength: categoryList.length});
  }else{
      res.status(204).send();
  }
}

exports.getActiveServices = async function (req, res,next){
  let serviceList = [];
  serviceList = await sql.getActiveServices();
  if(serviceList.length > 0){
      res.status(200).json({status:200, results: serviceList, resultsLength: serviceList.length});
  }else{
      res.status(204).send();
  }
}

exports.getActiveRequests = async function (req, res,next){
  let activeList = [];
  activeList = await sql.getActiveRequests();
  if(activeList.length > 0){
      res.status(200).json({status:200, results: activeList, resultsLength: activeList.length});
  }else{
      res.status(204).send();
  }
}

exports.getRenderedServices = async function (req, res,next){
  let renderedList = [];
  renderedList = await sql.getRenderedServices();
  if(renderedList.length > 0){
      res.status(200).json({status:200, results: renderedList, resultsLength: renderedList.length});
  }else{
      res.status(204).send();
  }
}

exports.getServiceById = async function (req, res,next){
  let serviceList = [];
  serviceList = await sql.getServiceById(req.params.serviceId);
  if(serviceList.length > 0){
      res.status(200).json({status:200, results: serviceList, resultsLength: serviceList.length});
  }else{
      res.status(204).send();
  }
}

exports.getRequestById = async function (req, res,next){
  let requestList = [];
  requestList = await sql.getRequestById(req.params.serviceId);
  if(requestList.length > 0){
      res.status(200).json({status:200, results: requestList, resultsLength: requestList.length});
  }else{
      res.status(204).send();
  }
}

exports.createNewRequest = async function (req, res,next){
  let rowCount = sql.createNewRequest(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestCreated: true});
  }else{
    res.status(202).send();
  }
}

exports.fulfillRequest = async function (req, res,next){
  let rowCount = sql.fulfillRequest(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestFulfilled: true});
  }else{
    res.status(202).send();
  }
}

exports.markBusinessNotified = async function (req, res,next){
  let rowCount = sql.markBusinessNotified(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestFulfilled: true});
  }else{
    res.status(202).send();
  }
}

exports.markFamilyNotified = async function (req, res,next){
  let rowCount = sql.markFamilyNotified(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestFulfilled: true});
  }else{
    res.status(202).send();
  }
}

exports.markBusinessFollowedUp = async function (req, res,next){
  let rowCount = sql.markBusinessFollowedUp(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestFulfilled: true});
  }else{
    res.status(202).send();
  }
}

exports.markFamilyFollowedUp = async function (req, res,next){
  let rowCount = sql.markFamilyFollowedUp(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestFulfilled: true});
  }else{
    res.status(202).send();
  }
}

exports.markServiceActive = async function (req, res,next){
  let rowCount = sql.markServiceActive(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestFulfilled: true});
  }else{
    res.status(202).send();
  }
}

exports.markServiceInactive = async function (req, res,next){
  let rowCount = sql.markServiceInactive(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestFulfilled: true});
  }else{
    res.status(202).send();
  }
}


exports.deleteRequest = async function (req, res,next){
  let rowCount = sql.deleteRequest(req.body);
  console.log(rowCount);
  if(rowCount == 1){
    res.status(201).json({requestFulfilled: true});
  }else{
    res.status(202).send();
  }
}

exports.getThisMonthFamilies = async function (req, res,next){
    let familyList = [];
    familyList = await sql.getThisMonthFamilies();
    if(familyList.length > 0){
        res.status(200).json({status:200, results: familyList, resultsLength: familyList.length});
    }else{
        res.status(204).send();
    }
}

exports.getFamiliesToApprove = async function (req, res,next){
    let familyList = [];
    familyList = await sql.getFamiliesToApprove();
    if(familyList.length > 0){
        res.status(200).json({status:200, results: familyList, resultsLength: familyList.length});
    }else{
        res.status(204).send();
    }
}

exports.getThisMonthBusinesses = async function (req, res,next){
    let businessList = [];
    businessList = await sql.getThisMonthBusinesses();
    if(businessList.length > 0){
        res.status(200).json({status:200, results: businessList, resultsLength: businessList.length});
    }else{
        res.status(204).send();
    }
}

exports.getBusinessesToApprove = async function (req, res,next){
    let businessList = [];
    businessList = await sql.getBusinessesToApprove();
    if(businessList.length > 0){
        res.status(200).json({status:200, results: businessList, resultsLength: businessList.length});
    }else{
        res.status(204).send();
    }
}

exports.getThisMonthRequests = async function (req, res,next){
    let requestList = [];
    requestList = await sql.getThisMonthRequests();
    if(requestList.length > 0){
        res.status(200).json({status:200, results: requestList, resultsLength: requestList.length});
    }else{
        res.status(204).send();
    }
}
exports.markFamilyActive = async function (req, res,next){
    let rowCount = sql.markFamilyActive(req.body);
    console.log(rowCount);
    if(rowCount == 1){
      res.status(201).json({requestFulfilled: true});
    }else{
      res.status(202).send();
    }
  }
  
  exports.markFamilyInactive = async function (req, res,next){
    let rowCount = sql.markFamilyInactive(req.body);
    console.log(rowCount);
    if(rowCount == 1){
      res.status(201).json({requestFulfilled: true});
    }else{
      res.status(202).send();
    }
  }

  exports.getActiveFamily = async function (req, res,next){
    let activeList = [];
    activeList = await sql.getActiveFamily();
    if(activeList.length > 0){
        res.status(200).json({status:200, results: activeList, resultsLength: activeList.length});
    }else{
        res.status(204).send();
    }
  }

  exports.getInactiveFamily = async function (req, res,next){
  let renderedList = [];
  renderedList = await sql.getInactiveFamily();
  if(renderedList.length > 0){
      res.status(200).json({status:200, results: renderedList, resultsLength: renderedList.length});
  }else{
      res.status(204).send();
  }
}
