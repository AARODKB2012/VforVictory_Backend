var Connection = require('tedious').Connection;
var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var tp = require('tedious-promises');
const { resolve } = require('path');

//This line alows to read environment variables from .env file or Azure App Service
require('dotenv').config();

var poolConfig = {
    min: 0,
    max: 100,
    idleTimeoutMillis: 30000,
    log: true //uncomment to see connection pool logs on terminal
};

var connectionConfig = {

    userName: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER_IP,
    options: {encrypt: true, database: process.env.DB_NAME}
};

//create the pool
var pool = new ConnectionPool(poolConfig, connectionConfig);
tp.setConnectionPool(pool);
pool.on('error', function(err) {
    console.error(err);
});

//Query Example
exports.getAllVolunteers = function() {
    return new Promise( resolve => {
        tp.sql("SELECT * FROM [dbo].[Volunteers]")
        .execute()
        .then(function(results) {
            // console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

exports.getVolunteerByUserNameAndPassword = function(userName, password) {
    return new Promise( resolve => {
        var sql = "SELECT [record_id] ,[first_name] ,[last_name] ,[username],[role],[email], [status] " +
                    " FROM [dbo].[Volunteers] where username= '"+userName+"' and password=HashBytes('MD5', '"+password+"') and status = 1";
        tp.sql(sql)
        .execute()
        .then(function(results) {
            //console.log(results);
            resolve(results);
        }).fail(function(err) {
            console.log(err);
        });
    });
}

// Use this example for when we need to insert something to DB
exports.createNewVolunteer = function(userObject) {
  pool.acquire(function (err, connection) {
      if (err) {
          console.error(err);
          return;
      }
      //use the connection as normal
      var request = new Request("INSERT INTO [dbo].[Volunteers] ([first_name], [last_name], [username], [password], [home_phone], [work_phone], [cell_phone], [email], [educational_background], " +
      " [current_licenses], [emergency_contact_name], [emergency_contact_phone], [emergency_contact_email], [emergency_contact_address], [drivers_license], [social_security], " +
      " [address], [availability], [role], [status]) " +
      " VALUES (@FIRST_NAME, @LAST_NAME, @USER_NAME, HashBytes('MD5', @PASSWORD), @HOME_PHONE, @WORK_PHONE, @CELL_PHONE, @EMAIL, @EDUCATION, @LICENSES," +
      " @EMERGENCY_FIRST_NAME, @EMERGENCY_PHONE, @EMERGENCY_EMAIL, @EMERGENCY_ADDRESS, @DRIVER_LICENSE, @SOCIAL_SECURITY, " +
      " @ADDRESS, @AVAILABILITY, @ROLE, @STATUS)",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          //release the connection back to the pool when finished
          connection.release();
      });

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
      connection.execSql(request);
  });

  // Returning one if no error occurred.
  return 1;
}

exports.updateVolunteer = function(userObject) {
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        //use the connection as normal
        var request = new Request("UPDATE [dbo].[Volunteers] " +
        "SET [first_name] = @FIRST_NAME, [last_name] = @LAST_NAME, [username] = @USER_NAME, [home_phone] = @HOME_PHONE, [work_phone] = @WORK_PHONE, [cell_phone] = @CELL_PHONE, " +
        "[email] = @EMAIL, [educational_background] = @EDUCATION, [current_licenses] = @LICENSES, [availability] = @AVAILABILITY, [role] = @ROLE, [status] = @STATUS, " +
        "[emergency_contact_name] = @EMERGENCY_FIRST_NAME, [emergency_contact_phone] = @EMERGENCY_PHONE, [emergency_contact_email] = @EMERGENCY_EMAIL, [emergency_contact_address] = @EMERGENCY_ADDRESS " +
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
            //release the connection back to the pool when finished
            connection.release();
        });

        request.addParameter('PASSWORD', TYPES.VarChar, passwordHash);
        request.addParameter('ID', TYPES.VarChar, volunteerId);
        connection.execSql(request);
    });

    // Returning one if no error occurred.
    return 1;
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

exports.getAllVolunteersBySearchValue = function(searchValue) {
  return new Promise( resolve => {
      var sql = "SELECT * FROM [ProjectZero].[dbo].[Volunteers] where first_name like '%'+'" +searchValue+ "'+ '%' or last_name like '%'+'" + searchValue + "' + '%'";
      console.log(sql);
      tp.sql(sql)
      .execute()
      .then(function(results) {
          // console.log(results);
          resolve(results);
      }).fail(function(err) {
          console.log(err);
      });
  });
}

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

exports.getRenderedServices = function() {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [dbo].[Services] WHERE active = 0")
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
      var request = new Request("INSERT INTO [dbo].[Services] ([family_name], [business_name], [business_category], [date_requested], [date_fulfilled], [notified_business], " +
      " [notified_family], [followedup_business], [followedup_family], [active]) " +
      " VALUES (@FAMILY_NAME, @BUSINESS_NAME, @BUSINESS_CATEGORY, @DATE_REQUESTED, @DATE_FULFILLED, @NOTIFIED_BUSINESS, @NOTIFIED_FAMILY, @FOLLOWEDUP_BUSINESS, @FOLLOWEDUP_FAMILY, @ACTIVE)",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('FAMILY_NAME', TYPES.VarChar, userObject.familyName);
      request.addParameter('BUSINESS_NAME', TYPES.VarChar, '');
      request.addParameter('BUSINESS_CATEGORY', TYPES.VarChar, userObject.businessCategory);
      request.addParameter('DATE_REQUESTED', TYPES.VarChar, userObject.dateRequested);
      request.addParameter('DATE_FULFILLED', TYPES.VarChar, '');
      request.addParameter('NOTIFIED_BUSINESS', TYPES.Bit, userObject.notifiedBusiness);
      request.addParameter('NOTIFIED_FAMILY', TYPES.Bit, userObject.notifiedFamily);
      request.addParameter('FOLLOWEDUP_BUSINESS', TYPES.Bit, userObject.followedupBusiness);
      request.addParameter('FOLLOWEDUP_FAMILY', TYPES.Bit, userObject.followedupFamily);
      request.addParameter('ACTIVE', TYPES.Bit, userObject.active);
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
      var request = new Request("UPDATE [dbo].[Services] SET [active] = 0 WHERE [family_name] = @FAMILY_NAME AND [date_requested] = @DATE_REQUESTED",
      function(err, rowCount) {
          if (err) {
              console.error(err);
              return;
          }
          // release the connection back to the pool when finished
          connection.release();
      });

      request.addParameter('FAMILY_NAME', TYPES.VarChar, userObject.familyName);
      request.addParameter('DATE_REQUESTED', TYPES.VarChar, userObject.dateRequested);
      request.addParameter('ACTIVE', TYPES.Bit, 0);
      connection.execSql(request);
  });

  return 1;
}
