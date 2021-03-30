var Connection = require('tedious').Connection;
var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var tp = exports.tp = require('tedious-promises');
const { resolve } = require('path');

// This line alows to read environment variables from .env file or Azure App Service
require("dotenv").config();

var poolConfig = {
    min: 0,
    max: 100,
    idleTimeoutMillis: 30000,
    log: true, // uncomment to see connection pool logs on terminal
};

var connectionConfig = {
    userName: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER_IP,
    options: {
        encrypt: true,
        database: process.env.DB_NAME
    }
};

// create the pool
var pool = new ConnectionPool(poolConfig, connectionConfig);
tp.setConnectionPool(pool);
pool.on("error", function (err) {
    console.error(err);
});

// Query Example
exports.getAllVolunteers = function () {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Volunteers]").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.getAllFamily = function() {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Family] WHERE active = 1")
        .execute()
        .then(function(results) {
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getVolunteerByUserNameAndPassword = function(userName, password) {
    return new Promise( resolve => {
        var sql = "SELECT [record_id] ,[first_name] ,[last_name] ,[username],[role],[email], [status], [profile_picture_url] " +
                    " FROM [dbo].[Volunteers] where username= '"+userName+"' and password=HashBytes('MD5', '"+password+"') and status = 1";
        tp.sql(sql)
        .execute()
        .then(function(results) {
            //console.log(results);
            resolve(results);
        }).fail(function (err) {
            //console.log(err);
        });
    });
};

exports.getCurrentUser = function(username) {
    return new Promise( resolve => {
        var sql = `SELECT [record_id] ,[first_name] ,[last_name] ,[username],[role],[email], [status], [profile_picture_url] FROM [dbo].[Volunteers] where username = '${username}' and status = 1`;
        tp.sql(sql)
        .execute()
        .then(function(results) {
            //console.log(results);
            resolve(results);
        }).fail(function (err) {
            //console.log(err);
        });
    });
};

// Use this example for when we need to insert something to DB
exports.createNewVolunteer = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      //use the connection as normal
      var request = new Request("INSERT INTO [dbo].[Volunteers] ([first_name], [last_name], [username], [password], [home_phone], [work_phone], [cell_phone], [email], [educational_background], " +
      " [current_licenses], [emergency_contact_name], [emergency_contact_lastname], [emergency_contact_phone], [emergency_contact_email], [emergency_contact_address], [drivers_license], [social_security], " +
      " [address], [availability], [role], [status], [created_by], [created_date]) " +
      " VALUES (@FIRST_NAME, @LAST_NAME, @USER_NAME, HashBytes('MD5', @PASSWORD), @HOME_PHONE, @WORK_PHONE, @CELL_PHONE, @EMAIL, @EDUCATION, @LICENSES," +
      " @EMERGENCY_FIRST_NAME, @EMERGENCY_LAST_NAME, @EMERGENCY_PHONE, @EMERGENCY_EMAIL, @EMERGENCY_ADDRESS, @DRIVER_LICENSE, @SOCIAL_SECURITY, " +
      " @ADDRESS, @AVAILABILITY, @ROLE, @STATUS, @CREATED_BY, @CREATED_DATE)",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          //release the connection back to the pool when finished
          connection.release();
      });
        request.addParameter("FIRST_NAME", TYPES.VarChar, userObject.firstName);
        request.addParameter("LAST_NAME", TYPES.VarChar, userObject.lastName);
        request.addParameter("USER_NAME", TYPES.VarChar, userObject.username);
        request.addParameter("PASSWORD", TYPES.VarChar, userObject.password);
        request.addParameter("EMAIL", TYPES.VarChar, userObject.email);
        request.addParameter("ADDRESS", TYPES.VarChar, userObject.address);
        request.addParameter("HOME_PHONE", TYPES.VarChar, userObject.homePhone);
        request.addParameter("CELL_PHONE", TYPES.VarChar, userObject.cellPhone);
        request.addParameter("WORK_PHONE", TYPES.VarChar, userObject.workPhone);
        request.addParameter("EDUCATION", TYPES.VarChar, userObject.education);
        request.addParameter("LICENSES", TYPES.VarChar, userObject.licenses);
        request.addParameter("AVAILABILITY", TYPES.VarChar, userObject.availability);
        request.addParameter("ROLE", TYPES.VarChar, userObject.role);
        request.addParameter("STATUS", TYPES.VarChar, userObject.status);
        request.addParameter("DRIVER_LICENSE", TYPES.Bit, userObject.driversLicense);
        request.addParameter("SOCIAL_SECURITY", TYPES.Bit, userObject.socialSecurity);
        request.addParameter("EMERGENCY_FIRST_NAME", TYPES.VarChar, userObject.emergencyFirstName);
        request.addParameter("EMERGENCY_LAST_NAME", TYPES.VarChar, userObject.emergencyLastName);
        request.addParameter("EMERGENCY_EMAIL", TYPES.VarChar, userObject.emergencyEmail);
        request.addParameter("EMERGENCY_PHONE", TYPES.VarChar, userObject.emergencyPhone);
        request.addParameter("EMERGENCY_ADDRESS", TYPES.VarChar, userObject.emergencyAddress);
        request.addParameter("CREATED_BY", TYPES.VarChar, userObject.createdBy);
        request.addParameter("CREATED_DATE", TYPES.Date, new Date);
        connection.execSql(request);
    });
    return 1;
};

// Use this example for when we need to insert something to DB
exports.createNewFamily = function(userObject) {
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        //use the connection as normal
        var request = new Request("INSERT INTO [dbo].[Family] ([first_name], [last_name], [phone_number], [street_address], [zipcode], [email], [cancer_warrior_name], [work_phone], [relationship_to_warrior]," +
        "[additional_info], [end_of_treatment_date], [active])" +
        "VALUES (@FIRST_NAME, @LAST_NAME, @PHONE_NUMBER, @STREET_ADDRESS, @ZIPCODE, @EMAIL, @CANCER_WARRIOR_NAME, @WORK_PHONE," +
        "@RELATIONSHIP_TO_WARRIOR, @ADDITIONAL_INFO, @END_OF_TREATMENT_DATE, @ACTIVE)",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });
          request.addParameter("FIRST_NAME", TYPES.VarChar, userObject.firstName);
          request.addParameter("LAST_NAME", TYPES.VarChar, userObject.lastName);
          request.addParameter("PHONE_NUMBER", TYPES.VarChar, userObject.phoneNumber);
          request.addParameter("STREET_ADDRESS", TYPES.VarChar, userObject.streetAddress);
          request.addParameter("ZIPCODE", TYPES.VarChar, userObject.zipcode);
          request.addParameter("EMAIL", TYPES.VarChar, userObject.email);
          request.addParameter("CANCER_WARRIOR_NAME", TYPES.VarChar, userObject.cancerWarriorname);
          request.addParameter("WORK_PHONE", TYPES.VarChar, userObject.workPhone);
          request.addParameter("RELATIONSHIP_TO_WARRIOR", TYPES.VarChar, userObject.relationshipTowarrior);
          request.addParameter("ADDITIONAL_INFO", TYPES.VarChar, userObject.additionalInfo);
          request.addParameter("END_OF_TREATMENT_DATE", TYPES.VarChar, userObject.endOftreatmentDate);
          request.addParameter('ACTIVE', TYPES.Bit, 1);
          connection.execSql(request);
      });
      return 1;
};

exports.getAllVolunteersByStatus = function (status) {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Volunteers] where status='" + status + "'").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.getVolunteerByUsername = function (username) {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Volunteers] where username='" + username + "'").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.getAllVolunteersBySearchValue = function (searchValue) {
    return new Promise((resolve) => {
        var sql = "SELECT * FROM [ProjectZero].[dbo].[Volunteers] where first_name like '%'+'" + searchValue + "'+ '%' or last_name like '%'+'" + searchValue + "' + '%'";
        console.log(sql);
        tp.sql(sql).execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.getAllBusinesses = function () {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Businesses]").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.updateVolunteer = function(userObject) {
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        //use the connection as normal
        var request = new Request("UPDATE [dbo].[Volunteers] " +
        "SET [first_name] = @FIRST_NAME, [last_name] = @LAST_NAME, [username] = @USER_NAME, [home_phone] = @HOME_PHONE, [work_phone] = @WORK_PHONE, [cell_phone] = @CELL_PHONE, " +
        "[email] = @EMAIL, [address] = @ADDRESS ,[educational_background] = @EDUCATION, [current_licenses] = @LICENSES, [availability] = @AVAILABILITY, [role] = @ROLE, [status] = @STATUS, " +
        "[emergency_contact_name] = @EMERGENCY_FIRST_NAME,[emergency_contact_lastname] = @EMERGENCY_LAST_NAME, [emergency_contact_phone] = @EMERGENCY_PHONE, [emergency_contact_email] = @EMERGENCY_EMAIL," + 
        "[emergency_contact_address] = @EMERGENCY_ADDRESS, [updated_by] = @UPDATED_BY, [updated_date] = @UPDATED_DATE " +
        "WHERE [record_id] = @ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });

        request.addParameter('ID', TYPES.VarChar, userObject.id);
        request.addParameter('FIRST_NAME', TYPES.VarChar, userObject.firstName);
        request.addParameter('LAST_NAME', TYPES.VarChar, userObject.lastName);
        request.addParameter('USER_NAME', TYPES.VarChar, userObject.username);
        request.addParameter('PASSWORD', TYPES.VarChar, userObject.password);
        request.addParameter('EMAIL', TYPES.VarChar, userObject.email);
        request.addParameter('ADDRESS', TYPES.VarChar, userObject.address);
        request.addParameter('HOME_PHONE', TYPES.VarChar, userObject.homePhone);
        request.addParameter('CELL_PHONE', TYPES.VarChar, userObject.cellPhone);
        request.addParameter('WORK_PHONE', TYPES.VarChar, userObject.workPhone);
        request.addParameter('EDUCATION', TYPES.VarChar, userObject.education);
        request.addParameter('LICENSES', TYPES.VarChar, userObject.licenses);
        request.addParameter('AVAILABILITY', TYPES.VarChar, userObject.availability);
        request.addParameter('ROLE', TYPES.VarChar, userObject.role);
        request.addParameter('STATUS', TYPES.VarChar, userObject.status);
        request.addParameter('DRIVER_LICENSE', TYPES.Bit, userObject.driversLicense);
        request.addParameter('SOCIAL_SECURITY', TYPES.Bit, userObject.socialSecurity);
        request.addParameter('EMERGENCY_FIRST_NAME', TYPES.VarChar, userObject.emergencyFirstName);
        request.addParameter('EMERGENCY_LAST_NAME', TYPES.VarChar, userObject.emergencyLastName);
        request.addParameter('EMERGENCY_EMAIL', TYPES.VarChar, userObject.emergencyEmail);
        request.addParameter('EMERGENCY_PHONE', TYPES.VarChar, userObject.emergencyPhone);
        request.addParameter('EMERGENCY_ADDRESS', TYPES.VarChar, userObject.emergencyAddress);
        request.addParameter("UPDATED_BY", TYPES.VarChar, userObject.updatedBy);
        request.addParameter("UPDATED_DATE", TYPES.Date, new Date);
        connection.execSql(request);
    });

    // Returning one if no error occurred.
    return 1;
}

exports.changeVolunteerPassword = function(passwordHash, volunteerId) {
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        //use the connection as normal
        var request = new Request("UPDATE [dbo].[Volunteers] SET [password] = HashBytes('MD5', @PASSWORD)" +
        "WHERE [record_id] = @ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("PASSWORD", TYPES.VarChar, passwordHash);
        request.addParameter("ID", TYPES.VarChar, volunteerId);
        connection.execSql(request);
    });
    return 1;
};

exports.getAllBudgets = function () {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Budget]").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
}


exports.getAllVolunteersByStatus = function(status) {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Volunteers] where status='"+status+"'")
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

exports.getAllBusinesses = function () {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Business]").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.getAllBudgets = function () {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Budget]").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.createNewBudget = function (budgetObj) {
console.log(budgetObj);
pool.acquire(function (err, connection) {
    if (err) {
        console.error(err);
        return;
    }
    // use the connection as normal
    var request = new Request("INSERT INTO [dbo].[Budget] ([id],[amount],[start_date],[finish_date],[family_id],[current_balance]) " + "VALUES (@ID ,@AMOUNT ,@START_DATE ,@FINISH_DATE ,@FAMILY_ID ,@CURRENT_BALANCE);", function (err, rowCount) {
        if (err) {
            console.error(err);
            return;
        }
        // release the connection back to the pool when finished
        connection.release();
    });
    request.addParameter("ID", TYPES.Int, budgetObj.id);
    request.addParameter("AMOUNT", TYPES.Float, budgetObj.amount);
    request.addParameter("START_DATE", TYPES.Date, budgetObj.start_date);
    request.addParameter("FINISH_DATE", TYPES.Date, budgetObj.finish_date);
    request.addParameter("FAMILY_ID", TYPES.Int, budgetObj.family_id);
    request.addParameter("CURRENT_BALANCE", TYPES.Float, budgetObj.current_balance);
    connection.execSql(request);
  });

  return 1;
};

exports.getBusinessById = function(businessId) {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Business] where record_id = " + businessId)
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
};


exports.getAllCategories = function () {
  return new Promise((resolve) => {
      tp.sql("SELECT * FROM [dbo].[Categories] order by [category_name]")
      .execute()
      .then(function (results) {
          resolve(results);
      }).fail(function (err) {
          console.log(err);
      });
  });
};

exports.createNewBusiness = function (businessObject) {
    //console.log(businessObject);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("INSERT INTO [dbo].[Business] ([business_name],[email],[primary_contact_fName],[primary_contact_lName], " +
        "[primary_contact_phone_number],[secondary_contact_fName],[secondary_contact_lName],[secondary_contact_phone_number]," +
        "[address],[Services_Offered],[Service_Area],[Discount_Amount],[Preferred_Method_Contact],[EOY_Receipt], [facebook_url], [twiter_url], [instagram_url], [business_url]," +
        "[notes],[active], [created_by], [created_date]) " +
        "VALUES (@BUSINESS_NAME, @EMAIL, @PRIMARY_CONTACT_FNAME, @PRIMARY_CONTACT_LNAME, @PRIMARY_CONTACT_PHONE_NUMBER, " +
        "@SECONDARY_CONTACT_FNAME,@SECONDARY_CONTACT_LNAME, @SECONDARY_CONTACT_PHONE_NUMBER, @ADDRESS, @SERVICES_OFFERED, " +
        "@SERVICE_AREA, @DISCOUNT_AMOUNT, @PREFERRED_METHOD_CONTACT, @EOY_RECEIPT, @FACEBOOK, @TWITTER, @INSTAGRAM, @WEBSITE, @NOTES, @ACTIVE,@CREATED_BY, @CREATED_DATE)", 
        function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("BUSINESS_NAME", TYPES.VarChar, businessObject.businessName);
        request.addParameter("EMAIL", TYPES.VarChar, businessObject.email);
        request.addParameter("PRIMARY_CONTACT_FNAME", TYPES.VarChar, businessObject.pContactFName);
        request.addParameter("PRIMARY_CONTACT_LNAME", TYPES.VarChar, businessObject.pContactLName);
        request.addParameter("PRIMARY_CONTACT_PHONE_NUMBER", TYPES.VarChar, businessObject.pContactPNum);
        request.addParameter("SECONDARY_CONTACT_FNAME", TYPES.VarChar, businessObject.sContactFName);
        request.addParameter("SECONDARY_CONTACT_LNAME", TYPES.VarChar, businessObject.sContactLName);
        request.addParameter("SECONDARY_CONTACT_PHONE_NUMBER", TYPES.VarChar, businessObject.sContactPNum);
        request.addParameter("ADDRESS", TYPES.VarChar, businessObject.address);
        request.addParameter("SERVICES_OFFERED", TYPES.VarChar, businessObject.category);
        request.addParameter("SERVICE_AREA", TYPES.VarChar, businessObject.serviceArea);
        request.addParameter("DISCOUNT_AMOUNT", TYPES.VarChar, businessObject.discountAmount);
        request.addParameter("PREFERRED_METHOD_CONTACT", TYPES.NVarChar, businessObject.preferredContact);
        request.addParameter("EOY_RECEIPT", TYPES.VarChar, businessObject.eoyReceipt);
        request.addParameter("FACEBOOK", TYPES.VarChar, businessObject.facebookUrl);
        request.addParameter("TWITTER", TYPES.VarChar, businessObject.twitterUrl);
        request.addParameter("INSTAGRAM", TYPES.VarChar, businessObject.instagramUrl);
        request.addParameter("WEBSITE", TYPES.VarChar, businessObject.website);
        request.addParameter("NOTES", TYPES.NVarChar, businessObject.notes);
        request.addParameter("ACTIVE", TYPES.Bit, 1);
        request.addParameter("CREATED_BY", TYPES.VarChar, businessObject.createdBy);
        request.addParameter("CREATED_DATE", TYPES.Date, new Date);
        connection.execSql(request);
    });
    return 1;
};

exports.updateBusiness = function(businessObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      //use the connection as normal
      var request = new Request("UPDATE [dbo].[Business] SET [business_name] = @BUSINESS_NAME,[email] = @EMAIL, [primary_contact_fName] = @PRIMARY_CONTACT_FNAME, " +
      "[primary_contact_lName] = @PRIMARY_CONTACT_LNAME, [primary_contact_phone_number] = @PRIMARY_CONTACT_PHONE_NUMBER, [secondary_contact_fName] = @SECONDARY_CONTACT_FNAME, " +
      "[secondary_contact_lName] = @SECONDARY_CONTACT_LNAME,[secondary_contact_phone_number] = @SECONDARY_CONTACT_PHONE_NUMBER, [address] = @ADDRESS, " +
      "[Services_Offered] = @SERVICES_OFFERED, [Service_Area] = @SERVICE_AREA,[Discount_Amount] = @DISCOUNT_AMOUNT,[Preferred_Method_Contact] = @PREFERRED_METHOD_CONTACT, " +
      "[EOY_Receipt] = @EOY_RECEIPT, [updated_by] = @UPDATED_BY, [updated_date] = @UPDATED_DATE, [active] = @ACTIVE, [facebook_url] = @FACEBOOK, [twiter_url] = @TWITTER, [instagram_url] = @INSTAGRAM, [business_url] = @WEBSITE "+
      " WHERE [record_id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          //release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, businessObject.id);
      request.addParameter("BUSINESS_NAME", TYPES.VarChar, businessObject.businessName);
      request.addParameter("EMAIL", TYPES.VarChar, businessObject.email);
      request.addParameter("PRIMARY_CONTACT_FNAME", TYPES.VarChar, businessObject.pContactFName);
      request.addParameter("PRIMARY_CONTACT_LNAME", TYPES.VarChar, businessObject.pContactLName);
      request.addParameter("PRIMARY_CONTACT_PHONE_NUMBER", TYPES.VarChar, businessObject.pContactPNum);
      request.addParameter("SECONDARY_CONTACT_FNAME", TYPES.VarChar, businessObject.sContactFName);
      request.addParameter("SECONDARY_CONTACT_LNAME", TYPES.VarChar, businessObject.sContactLName);
      request.addParameter("SECONDARY_CONTACT_PHONE_NUMBER", TYPES.VarChar, businessObject.sContactPNum);
      request.addParameter("ADDRESS", TYPES.VarChar, businessObject.address);
      request.addParameter("SERVICES_OFFERED", TYPES.VarChar, businessObject.category);
      request.addParameter("SERVICE_AREA", TYPES.VarChar, businessObject.serviceArea);
      request.addParameter("DISCOUNT_AMOUNT", TYPES.VarChar, businessObject.discountAmount);
      request.addParameter("PREFERRED_METHOD_CONTACT", TYPES.NVarChar, businessObject.preferredContact);
      request.addParameter("EOY_RECEIPT", TYPES.VarChar, businessObject.eoyReceipt);
      request.addParameter("UPDATED_BY", TYPES.VarChar, businessObject.updatedBy);
      request.addParameter("UPDATED_DATE", TYPES.Date, new Date);
      request.addParameter("ACTIVE", TYPES.Bit, 1);
      request.addParameter("FACEBOOK", TYPES.VarChar, businessObject.facebookUrl);
      request.addParameter("TWITTER", TYPES.VarChar, businessObject.twitterUrl);
      request.addParameter("INSTAGRAM", TYPES.VarChar, businessObject.instagramUrl);
      request.addParameter("WEBSITE", TYPES.VarChar, businessObject.website);
      connection.execSql(request);
  });

  // Returning one if no error occurred.
  return 1;
}

exports.getActiveBusinesses = function() {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Business] WHERE active = 1")
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

exports.getAllBudgets = function () {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Budget]").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.createNewBudget = function (budgetObj) {
    console.log(budgetObj);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("INSERT INTO [dbo].[Budget] ([id],[amount],[start_date],[finish_date],[family_id],[current_balance]) " + "VALUES (@ID ,@AMOUNT ,@START_DATE ,@FINISH_DATE ,@FAMILY_ID ,@CURRENT_BALANCE);", function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("ID", TYPES.Int, budgetObj.id);
        request.addParameter("AMOUNT", TYPES.Float, budgetObj.amount);
        request.addParameter("START_DATE", TYPES.Date, budgetObj.start_date);
        request.addParameter("FINISH_DATE", TYPES.Date, budgetObj.finish_date);
        request.addParameter("FAMILY_ID", TYPES.Int, budgetObj.family_id);
        request.addParameter("CURRENT_BALANCE", TYPES.Float, budgetObj.current_balance);
        connection.execSql(request);
    });

  return 1;
};

exports.getVolunteerById = function(volunteerId) {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Volunteers] where record_id = " + volunteerId)
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getVolunteerByEmail = function(volunteerEmail) {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Volunteers] where email = '" + volunteerEmail + "'")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getAllEducations = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Education_Levels]")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getAllRoles = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Roles]")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getAllServices = function() {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Services]")
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}


exports.getActiveServices = function() {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Services] WHERE active = 1")
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

exports.getActiveRequests = function() {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Requests] WHERE active = 1")
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

exports.getRenderedServices = function() {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Requests] WHERE active = 0")
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

exports.getServiceById = function(serviceId) {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Services] where id = " + serviceId)
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

exports.getRequestById = function(serviceId) {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Requests] where id = " + serviceId)
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

exports.createNewRequest = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("INSERT INTO [dbo].[Requests] ([name], [email], [business_name], [business_category], [date_requested], [date_fulfilled], [notified_business], " +
      " [notified_family], [followedup_business], [followedup_family], [active], [notes]) " +
      " VALUES (@NAME, @EMAIL, @BUSINESS_NAME, @BUSINESS_CATEGORY, @DATE_REQUESTED, @DATE_FULFILLED, @NOTIFIED_BUSINESS, @NOTIFIED_FAMILY, @FOLLOWEDUP_BUSINESS, @FOLLOWEDUP_FAMILY, @ACTIVE, @NOTES)",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('NAME', TYPES.NVarChar, userObject.name);
      request.addParameter('EMAIL', TYPES.NVarChar, userObject.email);
      request.addParameter('BUSINESS_NAME', TYPES.NVarChar, userObject.businessName);
      request.addParameter('BUSINESS_CATEGORY', TYPES.NVarChar, userObject.businessCategory);
      request.addParameter('DATE_REQUESTED', TYPES.NVarChar, userObject.dateRequested);
      request.addParameter('DATE_FULFILLED', TYPES.NVarChar, '');
      request.addParameter('NOTIFIED_BUSINESS', TYPES.Bit, userObject.notifiedBusiness);
      request.addParameter('NOTIFIED_FAMILY', TYPES.Bit, userObject.notifiedFamily);
      request.addParameter('FOLLOWEDUP_BUSINESS', TYPES.Bit, userObject.followedupBusiness);
      request.addParameter('FOLLOWEDUP_FAMILY', TYPES.Bit, userObject.followedupFamily);
      request.addParameter('ACTIVE', TYPES.Bit, 1);
      request.addParameter('NOTES', TYPES.NVarChar, userObject.notes);
      connection.execSql(request);
  });

  return 1;
}

exports.fulfillRequest = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("UPDATE [dbo].[Requests] SET [active] = 0, [date_fulfilled] = @DATE_FULFILLED WHERE [id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      request.addParameter('DATE_FULFILLED', TYPES.NVarChar, userObject.dateFulfilled)
      request.addParameter('ACTIVE', TYPES.Bit, 0);
      connection.execSql(request);
  });

  return 1;
}

exports.markBusinessNotified = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("UPDATE [dbo].[Requests] SET [notified_business] = 1 WHERE [id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      //request.addParameter('ACTIVE', TYPES.Bit, 0);
      connection.execSql(request);
  });

  return 1;
}

exports.markFamilyNotified = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("UPDATE [dbo].[Requests] SET [notified_family] = 1 WHERE [id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      //request.addParameter('ACTIVE', TYPES.Bit, 0);
      connection.execSql(request);
  });

  return 1;
}

exports.markBusinessFollowedUp = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("UPDATE [dbo].[Requests] SET [followedup_business] = 1 WHERE [id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      connection.execSql(request);
  });

  return 1;
}

exports.markFamilyFollowedUp = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("UPDATE [dbo].[Requests] SET [followedup_family] = 1 WHERE [id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      connection.execSql(request);
  });

  return 1;
}

exports.markServiceActive = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("UPDATE [dbo].[Services] SET [active] = 1 WHERE [id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      connection.execSql(request);
  });

  return 1;
}

exports.markServiceInactive = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("UPDATE [dbo].[Services] SET [active] = 0 WHERE [id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      connection.execSql(request);
  });

  return 1;
}

exports.deleteRequest = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("DELETE FROM [dbo].[Requests] WHERE [id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      connection.execSql(request);
  });

  return 1;
}


exports.getThisMonthFamilies = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family] where DATEDIFF(MONTH, GETDATE(), created_date) < 30")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getFamiliesToApprove = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family] where active = 1 and approved_by is null and approved_date is null")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getThisMonthBusinesses = function() {
    return new Promise( resolve => {
        tp.sql(" SELECT * FROM [dbo].[Business] where DATEDIFF(MONTH, GETDATE(), created_date) < 30")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getBusinessesToApprove = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Business] where approved_by is null and approved_date is null")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getThisMonthRequests = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Requests] where DATEDIFF(MONTH, GETDATE(), date_requested) < 30")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getActiveFamily = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family] WHERE active = 1")
    .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}
      
exports.getInactiveFamily = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family] WHERE active = 0")  
    .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}
  
exports.markFamilyActive = function(userObject) {
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("UPDATE [dbo].[Family] SET [active] = 1 WHERE [id] = @ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });

        request.addParameter('ID', TYPES.VarChar, userObject.id);
        connection.execSql(request);
    });

    return 1;
}

exports.markFamilyInactive = function(userObject) {
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("UPDATE [dbo].[Family] SET [active] = 0 WHERE [id] = @ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });

        request.addParameter('ID', TYPES.VarChar, userObject.id);
        connection.execSql(request);
    });

    return 1;
}

exports.createNewCategory = function (businessObject) {
    console.log(businessObject);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("INSERT INTO [dbo].[Categories] ([CATEGORY_NAME], [created_by], [created_date]) " +
        "VALUES (@CATEGORY_NAME, @CREATED_BY, @CREATED_DATE)", 
        function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("CATEGORY_NAME", TYPES.VarChar, businessObject.categoryName);
        request.addParameter("CREATED_BY", TYPES.VarChar, businessObject.createdBy);
        request.addParameter("CREATED_DATE", TYPES.Date, new Date);
        connection.execSql(request);
    });
    return 1;
};

exports.getCategoryById = function(categoryId) {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Categories] where id = " + categoryId)
        .execute()
        .then(function(results) {
            //console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
};

exports.updateCategory = function (businessObject) {
    console.log(businessObject);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("update [dbo].[Categories] set category_name = @CATEGORY_NAME, updated_by = @UPDATED_BY, updated_date = @UPDATED_DATE where id = @ID", 
        function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("ID", TYPES.VarChar, businessObject.id);
        request.addParameter("CATEGORY_NAME", TYPES.VarChar, businessObject.categoryName);
        request.addParameter("UPDATED_BY", TYPES.VarChar, businessObject.updatedBy);
        request.addParameter("UPDATED_DATE", TYPES.Date, new Date);
        connection.execSql(request);
    });
    return 1;
};

exports.getServicesRendered = function(businessName) {
    return new Promise( resolve => {
        tp.sql(`select id, name, date_requested, date_fulfilled, active from [dbo].[Requests] where business_name = '${businessName}'`)
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.approveBusiness = function (businessId, approver) {
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("update [dbo].[Business] set [approved_by] = @APPROVED_BY, [approved_date] = @APPROVED_DATE where [record_id] = @ID", 
        function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("ID", TYPES.VarChar, businessId);
        request.addParameter("APPROVED_BY", TYPES.VarChar, approver);
        request.addParameter("APPROVED_DATE", TYPES.Date, new Date);
        connection.execSql(request);
    });
    return 1;
};