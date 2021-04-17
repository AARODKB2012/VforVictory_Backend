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
    var request = new Request("INSERT INTO [dbo].[Budget] ([amount],[created_date],[created_by],[current_balance],[family_id],[description],[comment]) " +
        "VALUES (@AMOUNT ,@CREATED_DATE,@CREATED_BY,@CURRENT_BALANCE ,@FAMILY_ID ,@DESCRIPTION ,@COMMENT);",
         function (err, rowCount) {
        if (err) {
            console.error(err);
            return;
        }
        // release the connection back to the pool when finished
        connection.release();
    });
   //request.addParameter("ID", TYPES.Int, budgetObj.id);
    request.addParameter("AMOUNT", TYPES.Float, budgetObj.amount);
    request.addParameter("CREATED_DATE", TYPES.Date, new Date);
    request.addParameter("CREATED_BY", TYPES.VarChar, budgetObj.created_by);
    request.addParameter("CURRENT_BALANCE", TYPES.Float, budgetObj.current_balance);
    request.addParameter("FAMILY_ID", TYPES.Int, budgetObj.familyId);
    request.addParameter("DESCRIPTION", TYPES.NVarChar,budgetObj.description);
    request.addParameter("COMMENT", TYPES.NVarChar,budgetObj.comment);
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
      tp.sql("SELECT * FROM [dbo].[Categories] order by (case [category_name] when 'Others' then 2 else 1 end) ")
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
      request.addParameter("ACTIVE", TYPES.Bit, businessObject.active);
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
      tp.sql("SELECT * FROM [dbo].[Business] WHERE active = 1 and approved_by is not null")
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

exports.getAllRequests = function() {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Request] WHERE active = 1")
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
      tp.sql("SELECT * FROM [dbo].[Request] WHERE pending = 1 and active = 1")
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
      tp.sql("SELECT * FROM [dbo].[Request] WHERE pending = 0 and active = 1")
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
      tp.sql("SELECT * FROM [dbo].[Request] where id = " + serviceId)
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
      var request = new Request("INSERT INTO [dbo].[Request] ([family_id], [business_id], [pending], [requested_date], [notified_business], [notified_family], [notes], [active]) " +
      " VALUES (@FAMILY_ID, @BUSINESS_ID, @PENDING, @REQUESTED_DATE, @NOTIFIED_BUSINESS, @NOTIFIED_FAMILY, @NOTES, @ACTIVE)",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });
      request.addParameter('FAMILY_ID', TYPES.NVarChar, userObject.familyId);
      request.addParameter('BUSINESS_ID', TYPES.NVarChar, userObject.businessId);
      request.addParameter('PENDING', TYPES.Bit, 1);
      request.addParameter('REQUESTED_DATE', TYPES.Date, new Date);
      request.addParameter('NOTIFIED_BUSINESS', TYPES.Bit, 0);
      request.addParameter('NOTIFIED_FAMILY', TYPES.Bit, 0);
      request.addParameter('NOTES', TYPES.NVarChar, userObject.notes);
      request.addParameter('ACTIVE', TYPES.Bit, 1);
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
      var request = new Request("UPDATE [dbo].[Request] SET [pending] = @PENDING, [approved] = @APPROVED, [fulfilled_date] = @FULFILLED_DATE, [fulfilled_by] = @FULFILLED_BY, " +
      "[followedup_business] = @FOLLOWEDUP_BUSINESS, [followedup_family] = @FOLLOWEDUP_FAMILY, [service_value] = @SERVICE_VALUE WHERE [record_id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      request.addParameter('FULFILLED_DATE', TYPES.Date, new Date);
      request.addParameter('FULFILLED_BY', TYPES.NVarChar, userObject.currentUser);
      request.addParameter('APPROVED', TYPES.Bit, userObject.approved);
      request.addParameter('PENDING', TYPES.Bit, 0);
      request.addParameter('FOLLOWEDUP_BUSINESS', TYPES.Bit, userObject.followedUpB);
      request.addParameter('FOLLOWEDUP_FAMILY', TYPES.Bit, userObject.followedUpF);
      request.addParameter('SERVICE_VALUE', TYPES.Float, userObject.value)
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
      var request = new Request("UPDATE [dbo].[Request] SET [notified_business] = @TOGGLE WHERE [record_id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      request.addParameter('TOGGLE', TYPES.Bit, userObject.toggle);
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
      var request = new Request("UPDATE [dbo].[Request] SET [notified_family] = @TOGGLE WHERE [record_id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      request.addParameter('TOGGLE', TYPES.Bit, userObject.toggle);
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
      var request = new Request("UPDATE [dbo].[Request] SET [followedup_business] = @TOGGLE WHERE [record_id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      request.addParameter('TOGGLE', TYPES.Bit, userObject.toggle);
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
      var request = new Request("UPDATE [dbo].[Request] SET [followedup_family] = @TOGGLE WHERE [record_id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      request.addParameter('TOGGLE', TYPES.Bit, userObject.toggle);
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
      var request = new Request("UPDATE [dbo].[Request] SET [active] = 0 WHERE [record_id] = @ID",
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
        tp.sql("SELECT * FROM [dbo].[Request] where DATEDIFF(MONTH, GETDATE(), requested_date) < 30 and active = 1")
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


exports.getFamilyByEmail = function(familyEmail) {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Family] where email = '" + familyEmail + "' and active = 1")
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

exports.getFamilyById = function(familyId) {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Family] where id = " + familyId)
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}


exports.modifyBudget = function (budgetObj) {
    console.log(budgetObj);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        //use the connection as normal
        var request = new Request("UPDATE [dbo].[Budget] SET [amount] = @AMOUNT, updated_date = @UPDATED_DATE , updated_by = @UPDATED_BY, " +
        "[current_balance] = @CURRENT_BALANCE, [family_id] = @FAMILY_ID, [description] = @DESCRIPTION, [comment] = @COMMENT WHERE [id] = @ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("ID", TYPES.Int, budgetObj.id);
        request.addParameter("AMOUNT", TYPES.Float, budgetObj.amount);
        request.addParameter("UPDATED_DATE", TYPES.Date, new Date);
        request.addParameter("UPDATED_BY", TYPES.VarChar, budgetObj.updated_by);
        request.addParameter("CURRENT_BALANCE", TYPES.Float, budgetObj.current_balance);
        request.addParameter("FAMILY_ID", TYPES.Int, budgetObj.family_id);
        request.addParameter("DESCRIPTION", TYPES.NVarChar,budgetObj.description);
        request.addParameter("COMMENT", TYPES.NVarChar,budgetObj.comment);
        connection.execSql(request);
    });
    return 1;
}

exports.getBudgetByID = function(id) {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Budget] where id = " + id)
    .execute()
        .then(function(results){
            resolve(results);
        }).fail(function(err){
            console.log(err);
        });
    });
}

exports.createNewExpense = function(expenseObj){
console.log(expenseObj);
    pool.acquire(function (err, connection) {
    if (err) {
        console.error(err);
        return;
    }
     // use the connection as normal
    var request = new Request("INSERT INTO [dbo].[Expense] ([description],[created_date],[created_by],[expense_amount],[budget_id])" +
    "VALUES (@DESCRIPTION, @CREATED_DATE,@CREATED_BY,@EXPENSE_AMOUNT,@BUDGET_ID)",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
                //release the connection back to the pool when finished
                connection.release();
        });
        request.addParameter("DESCRIPTION", TYPES.NVarChar, expenseObj.description);
        request.addParameter("CREATED_DATE", TYPES.Date, new Date);
        request.addParameter("CREATED_BY", TYPES.VarChar, expenseObj.created_by);
        request.addParameter("EXPENSE_AMOUNT", TYPES.Float, expenseObj.expense_amount);
        request.addParameter("BUDGET_ID", TYPES.Int, expenseObj.budget_id);
        connection.execSql(request);
    });
    return 1;
};

exports.getAllExpenses = function(){
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[EXPENSE]")
    .execute()
        .then(function(results){
            resolve(results);
        }).fail(function(err){
            console.log(err);
        });
    });
}

exports.modifyExpense = function (expenseObj) {
    console.log(expenseObj);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        //use the connection as normal
        var request = new Request("UPDATE [dbo].[Expense] SET [description] = @DESCRIPTION,[charge_date] = @CHARGE_DATE, [amount] = @AMOUNT," +
        "[comment] = @COMMENT, [budget_id] = @BUDGET_ID WHERE [id] = @ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("ID", TYPES.Int, expenseObj.id);
        request.addParameter("DESCRIPTION", TYPES.Text, expenseObj.description);
        request.addParameter("CHARGE_DATE", TYPES.Date, expenseObj.charge_date);
        request.addParameter("AMOUNT", TYPES.Float, expenseObj.amount);
        request.addParameter("COMMENT", TYPES.Text, expenseObj.comment);
        request.addParameter("BUDGET_ID", TYPES.Int, expenseObj.budget_id);
        connection.execSql(request);
    });
    return 1;
}

exports.getExpenseByID = function(id) {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Expense] where id = " + id)
    .execute()
        .then(function(results){
            resolve(results);
        }).fail(function(err){
            console.log(err);
        });
    });
}

exports.createNewVPizzaCard = function(vPizzaObj){
    console.log(vPizzaObj);
        pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
         // use the connection as normal
        var request = new Request("INSERT INTO [dbo].[VPizza] ([refill_date], [family_id]) VALUES (@REFILL_DATE,@FAMILY_ID)",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });

        request.addParameter("REFILL_DATE", TYPES.Date, new Date);
        request.addParameter("FAMILY_ID", TYPES.Int, vPizzaObj.family_id);
        connection.execSql(request);
    });
    return 1;
};

exports.getAllVGiftCards = function(){
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[VPizza]")
    .execute()
        .then(function(results){
            resolve(results);
        }).fail(function(err){
            console.log(err);
        });
    });
}

exports.modifyVPizzaCard = function(pizzaCardObj){
    console.log(pizzaCardObj);
        pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
         //use the connection as normal
         var request = new Request("UPDATE [dbo].[VPizza_Card] SET [description] = @DESCRIPTION,[amount] = @AMOUNT,[familyId] = @FAMILYID, " +
         "[currentBalance] = @CURRENTBALANCE, [lastRefillDate] = @LASTREFILLDATE) WHERE [id] = @ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("ID", TYPES.Int, pizzaCardObj.id);
        request.addParameter("DESCRIPTION", TYPES.Text, pizzaCardObj.description);
        request.addParameter("AMOUNT", TYPES.Float, pizzaCardObj.amount);
        request.addParameter("FAMILYID", TYPES.Int, pizzaCardObj.familyId);
        request.addParameter("CURRENTBALANCE", TYPES.Float, pizzaCardObj.currentBalance);
        request.addParameter("LASTREFILLDATE", TYPES.Date, pizzaCardObj.lastRefillDate);
        connection.execSql(request);
    });
    return 1;
};

exports.getBudgetByFamilyID = function(familyId) {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Budget] where familyId = " + familyId)
    .execute()
        .then(function(results){
            resolve(results);
        }).fail(function(err){
            console.log(err);
        });
    });
}

exports.getThisMonthExpenses = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Expense] WHERE DATEDIFF(day,charge_date,GETDATE()) between 0 and 30")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.createNewFamily = function(familyObj){
    console.log(familyObj);
        pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }

        var request = new Request("INSERT INTO [dbo].[Family] ([first_name], [last_name], [phone_number], [street_address], [zipcode], [email], [cancer_warrior_name], " +
        "[work_phone], [relationship_to_warrior], [additional_info], [end_of_treatment_date], [active], [created_date], [created_by]," +
        "[updated_date], [updated_by], [deleted_date], [deleted_by], [approved_date], [approved_by], [familySize], [hearAbout], [welcomeLetter], [treamentLetter], [subscriberList], [facebookGroup],[vPizza_giftcard],[vPizza_refill_amount]) " +
        "VALUES (@FIRST_NAME, @LAST_NAME, @PHONE_NUMBER, @STREET_ADDRESS, @ZIPCODE, @EMAIL, @CANCER_WARRIOR_NAME, @WORK_PHONE," +
        "@RELATIONSHIP_TO_WARRIOR, @ADDITIONAL_INFO, @END_OF_TREATMENT_DATE,@ACTIVE, @CREATED_DATE, @CREATED_BY, " +
        "@UPDATED_DATE, @UPDATED_BY, @DELETED_DATE, @DELETED_BY, @APPROVED_DATE, @APPROVED_BY, @FAMILYSIZE, @HEARABOUT, @WELCOMELETTER, @TREAMENTLETTER, @SUBSCRIBERLIST,@FACEBOOKGROUP,@VPIZZA_GIFTCARD,@VPIZZA_REFILL_AMOUNT)",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("FIRST_NAME", TYPES.VarChar, familyObj.first_name);
        request.addParameter("LAST_NAME", TYPES.VarChar, familyObj.last_name);
        request.addParameter("PHONE_NUMBER", TYPES.VarChar, familyObj.phone_number);
        request.addParameter("STREET_ADDRESS", TYPES.VarChar, familyObj.street_address);
        request.addParameter("ZIPCODE", TYPES.VarChar, familyObj.zipcode);
        request.addParameter("EMAIL", TYPES.VarChar, familyObj.email);
        request.addParameter("CANCER_WARRIOR_NAME", TYPES.VarChar, familyObj.cancer_warrior_name);
        request.addParameter("WORK_PHONE", TYPES.VarChar, familyObj.work_phone);
        request.addParameter("RELATIONSHIP_TO_WARRIOR", TYPES.VarChar, familyObj.relationship_to_warrior);
        request.addParameter("ADDITIONAL_INFO", TYPES.VarChar, familyObj.additional_info);
        request.addParameter("END_OF_TREATMENT_DATE", TYPES.VarChar, familyObj.end_of_treatment_date);
        request.addParameter("ACTIVE", TYPES.Bit, 1);
        request.addParameter("CREATED_DATE", TYPES.Date, new Date);
        request.addParameter("CREATED_BY", TYPES.VarChar, familyObj.created_by);
        request.addParameter("UPDATED_DATE", TYPES.Date, familyObj.updated_date);
        request.addParameter("UPDATED_BY", TYPES.VarChar, familyObj.updated_by);
        request.addParameter("DELETED_DATE", TYPES.Date, familyObj.deleted_date);
        request.addParameter("DELETED_BY", TYPES.VarChar, familyObj.deleted_by);
        request.addParameter("APPROVED_DATE", TYPES.Date, familyObj.approved_date);
        request.addParameter("APPROVED_BY", TYPES.VarChar, familyObj.approved_by);
        request.addParameter("FAMILYSIZE", TYPES.VarChar, familyObj.familysize);
        request.addParameter("HEARABOUT", TYPES.VarChar, familyObj.hearabout);
        request.addParameter("WELCOMELETTER",TYPES.Bit, 0);
        request.addParameter("TREAMENTLETTER",TYPES.Bit, 0);
        request.addParameter("SUBSCRIBERLIST",TYPES.Bit, 0);
        request.addParameter("FACEBOOKGROUP",TYPES.Bit, 0);
        request.addParameter("VPIZZA_GIFTCARD", TYPES.VarChar, familyObj.vPizza_giftcard);
        request.addParameter("VPIZZA_REFILL_AMOUNT", TYPES.Float, familyObj.vPizza_refill_amount);
        connection.execSql(request);
    });
    return 1;
}

exports.getFamilyByID = function(id) {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family] WHERE id = " + id)
    .execute()
        .then(function(results){
            resolve(results);
        }).fail(function(err){
            console.log(err);
        });
    });
}

exports.modifyFamilyByID = function(familyObj) {
    console.log(familyObj);
    familyObj  = {
        ...familyObj,
        welcomeLetter:  getBitValue(familyObj.welcomeLetter),
        treamentLetter:  getBitValue(familyObj.treamentLetter),
        subscriberList:getBitValue(familyObj.subscriberList),
        facebookGroup:getBitValue(familyObj.facebookGroup)
    }
    console.log(familyObj);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        //use the connection as normal
        var request = new Request("UPDATE [dbo].[Family] SET [first_name] = @FIRST_NAME, [last_name] = @LAST_NAME, [phone_number] = PHONE_NUMBER, [street_address] = @STREET_ADDRESS, " +
        "[zipcode] = @ZIPCODE, [email] = @EMAIL, [cancer_warrior_name] = @CANCER_WARRIOR_NAME ,[work_phone] = @WORK_PHONE, [relationship_to_warrior] = @RELATIONSHIP_TO_WARRIOR, [additional_info] = @ADDITIONAL_INFO , [end_of_treatment_date] = @END_OF_TREATMENT_DATE, " +
        "[active] = @ACTIVE, [updated_date] = @UPDATED_DATE, [updated_by] = @UPDATED_BY, " +
        "[deleted_date] = @DELETED_DATE, [deleted_by] = @DELETED_BY, [approved_date] = @APPROVED_DATE, [approved_by] = @APPROVED_BY , [familySize] = @FAMILYSIZE, [hearAbout] = @HEARABOUT,"+
        "[welcomeLetter] = @WELCOMELETTER, [treamentLetter] = @TREAMENTLETTER , [subscriberList] = @SUBSCRIBERLIST , [facebookGroup] = @FACEBOOKGROUP, [vPizza_giftcard] = @VPIZZA_GIFTCARD ,[vPizza_refill_amount] = @VPIZZA_REFILL_AMOUNT WHERE [id] = @ID ",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("FIRST_NAME", TYPES.VarChar, familyObj.first_name);
        request.addParameter("LAST_NAME", TYPES.VarChar, familyObj.last_name);
        request.addParameter("PHONE_NUMBER", TYPES.VarChar, familyObj.phone_number);
        request.addParameter("STREET_ADDRESS", TYPES.VarChar, familyObj.street_address);
        request.addParameter("ZIPCODE", TYPES.VarChar, familyObj.zipcode);
        request.addParameter("EMAIL", TYPES.VarChar, familyObj.email);
        request.addParameter("CANCER_WARRIOR_NAME", TYPES.VarChar, familyObj.cancer_warrior_name);
        request.addParameter("WORK_PHONE", TYPES.VarChar, familyObj.work_phone);
        request.addParameter("RELATIONSHIP_TO_WARRIOR", TYPES.VarChar, familyObj.relationship_to_warrior);
        request.addParameter("ADDITIONAL_INFO", TYPES.VarChar, familyObj.additional_info);
        request.addParameter("END_OF_TREATMENT_DATE", TYPES.VarChar, familyObj.end_of_treatment_date);
        request.addParameter("ID", TYPES.Int, familyObj.id);
        request.addParameter("ACTIVE", TYPES.Bit, 1);
        request.addParameter("UPDATED_DATE", TYPES.Date, new Date);
        request.addParameter("UPDATED_BY", TYPES.VarChar, familyObj.updated_by);
        request.addParameter("DELETED_DATE", TYPES.Date, familyObj.deleted_date);
        request.addParameter("DELETED_BY", TYPES.VarChar, familyObj.deleted_by);
        request.addParameter("APPROVED_DATE", TYPES.Date, familyObj.approved_date);
        request.addParameter("APPROVED_BY", TYPES.VarChar, familyObj.approved_by);
        request.addParameter("FAMILYSIZE", TYPES.VarChar, familyObj.familysize);
        request.addParameter("HEARABOUT", TYPES.VarChar, familyObj.hearabout);
        request.addParameter("WELCOMELETTER",TYPES.Bit, familyObj.welcomeLetter);
        request.addParameter("TREAMENTLETTER",TYPES.Bit, familyObj.treamentLetter);
        request.addParameter("SUBSCRIBERLIST",TYPES.Bit, familyObj.subscriberList);
        request.addParameter("FACEBOOKGROUP",TYPES.Bit, familyObj.facebookGroup);
        request.addParameter("VPIZZA_GIFTCARD", TYPES.VarChar, familyObj.vPizza_giftcard);
        request.addParameter("VPIZZA_REFILL_AMOUNT", TYPES.Float, familyObj.vPizza_refill_amount);
        connection.execSql(request);
    });
    // Returning one if no error occurred.
    return 1;
}

function getBitValue(value) {
    console.log(value ? 1: 0);
    return value ? 1 : 0;
}

exports.getThisMonthFamiliesApproved = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family] WHERE DATEDIFF(day,approved_date,GETDATE()) between 0 and 30")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getThisMonthFamiliesCreated = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family] WHERE DATEDIFF(day,created_date,GETDATE()) between 0 and 30")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
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

exports.getServicesRendered = function(businessId) {
    return new Promise( resolve => {
        tp.sql(`select (select CONCAT(f.first_name,' ', f.last_name) from Family f where id = r.family_id) as name, record_id, requested_date, fulfilled_date, service_value, service_cost, pending from [dbo].[Request] r where business_id = '${businessId}'`)
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

exports.setValueCost = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      // use the connection as normal
      var request = new Request("UPDATE [dbo].[Request] SET [service_value] = @SERVICE_VALUE, [service_cost] = @SERVICE_COST WHERE [record_id] = @ID",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('ID', TYPES.VarChar, userObject.id);
      request.addParameter('SERVICE_VALUE', TYPES.Float, userObject.value);
      request.addParameter('SERVICE_COST', TYPES.Float, userObject.cost);
      connection.execSql(request);
  });

  return 1;
}

exports.approveFamily = function (familyId, approver) {
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("update [dbo].[Family] set [approved_by] = @APPROVED_BY, [approved_date] = @APPROVED_DATE where [id] = @ID",
        function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("ID", TYPES.VarChar, familyId);
        request.addParameter("APPROVED_BY", TYPES.VarChar, approver);
        request.addParameter("APPROVED_DATE", TYPES.Date, new Date);
        connection.execSql(request);
    });
    return 1;
};


exports.getApprovedFamily = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family] where active = 1 and approved_by is not null and approved_date is not null")
      .execute()
        .then(function(results){
            resolve(results);
        }).fail(function(err){
            console.log(err);
        });
    });
}

exports.getFamilyNotes = function(id) {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Family_Note] where active = 1 and family_id = " + id)
    .execute()
        .then(function(results){
            resolve(results);
        }).fail(function(err){
            console.log(err);
        });
    });
}

exports.addNote = function (noteObj) {
    console.log(noteObj);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("INSERT INTO [dbo].[Family_Note] ([family_id],[contents],[created_by],[last_modified],[active]) "
        + "VALUES (@FAMILY_ID, @CONTENTS, @CREATED_BY, @LAST_MODIFIED, @ACTIVE)", function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("FAMILY_ID", TYPES.Int, noteObj.familyId);
        request.addParameter("CONTENTS", TYPES.NVarChar, noteObj.contents);
        request.addParameter("CREATED_BY", TYPES.NVarChar, noteObj.currentUser);
        request.addParameter("LAST_MODIFIED", TYPES.DateTime, new Date);
        request.addParameter("ACTIVE", TYPES.Bit, 1);
        connection.execSql(request);
    });

  return 1;
};

exports.editNote = function(noteObj){
    console.log(noteObj);
        pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
         //use the connection as normal
         var request = new Request("UPDATE [dbo].[Family_Note] SET [contents] = @CONTENTS, " +
         "[created_by] = @CREATED_BY, [last_modified] = @LAST_MODIFIED WHERE [record_id] = @RECORD_ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("RECORD_ID", TYPES.Int, noteObj.id);
        request.addParameter("CONTENTS", TYPES.NVarChar, noteObj.contents);
        request.addParameter("CREATED_BY", TYPES.NVarChar, noteObj.currentUser);
        request.addParameter("LAST_MODIFIED", TYPES.DateTime, new Date);
        connection.execSql(request);
    });
    return 1;
};

exports.deleteNote = function(noteObj){
    console.log(noteObj);
        pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
         //use the connection as normal
         var request = new Request("INSERT INTO [dbo].[Family_Note] VALUES [active] = 0 WHERE [record_id] = @RECORD_ID",
        function(err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            //release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("RECORD_ID", TYPES.Int, noteObj.id);
        connection.execSql(request);
    });
    return 1;
};

exports.getVPizzaGFByFamilyID = function(id) {
    return new Promise( resolve => {
        tp.sql("SELECT [vPizza_giftcard], [vPizza_refill_amount] FROM [dbo].[Family] where id = " + id +
        "")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getFullVPizzaGF = function (id, family_id) {
    return new Promise( resolve => {
        tp.sql("SELECT [dbo].[Family].[vPizza_giftcard],[dbo].[Family].[vPizza_refill_amount],[dbo].[VPizza].[refill_date],[dbo].[VPizza].[family_id]  " +
        "FROM [dbo].[Family], [dbo].[VPizza] "  +
        "WHERE ([dbo].[Family].[id]= " + id + ") AND ([dbo].[VPizza].[family_id]= " + family_id + ")")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getVPizzaTransactionHistory = function () {
  return new Promise((resolve) => {
      tp.sql("SELECT * FROM [dbo].[VPizza]").execute().then(function (results) { // console.log(results);
          resolve(results);
      }).fail(function (err) {
          console.log(err);
      });
  });
};

exports.markPizzaRefilled = function(pizzaObj){
  console.log(pizzaObj);
      pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
       //use the connection as normal
       var request = new Request("INSERT INTO [dbo].[VPizza] ([refill_date], [family_id], [refilled_by], [refill_balance]) " +
       "VALUES (@REFILL_DATE, @FAMILY_ID, @REFILLED_BY, @REFILL_BALANCE)",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          //release the connection back to the pool when finished
          connection.release();
      });
      request.addParameter("REFILL_DATE", TYPES.Date, new Date);
      request.addParameter("FAMILY_ID", TYPES.Int, pizzaObj.id);
      request.addParameter("REFILLED_BY", TYPES.NVarChar, pizzaObj.currentUser);
      request.addParameter("REFILL_BALANCE", TYPES.Float, pizzaObj.balance);
      connection.execSql(request);
  });
  return 1;
};

exports.getFamilyServicesRendered = function(familyId) {
  return new Promise( resolve => {
      tp.sql(`select (select f.business_name from Business f where record_id = r.business_id) as business_name, record_id, requested_date, fulfilled_date, service_value, service_cost, pending from [dbo].[Request] r where family_id = '${familyId}'`)
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}
