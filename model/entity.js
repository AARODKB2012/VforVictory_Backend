var Connection = require('tedious').Connection;
var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var tp = require('tedious-promises');
const { resolve } = require('path');
var md5 = require('md5');

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
    options: {encrypt: true, database: process.env.DB_NAME, port: 1488}
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
        tp.sql("SELECT * FROM [ProjectZero].[dbo].[Volunteers]")
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
        tp.sql("SELECT [id] ,[first_name] ,[last_name] ,[username],[role],[email], [status] " +
        " FROM [ProjectZero].[dbo].[Volunteers] where username= '"+userName+"' and password=HashBytes('MD5', '"+password+"') and status = 'Approved'")
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
  console.log(userObject);
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

exports.getAllVolunteersByStatus = function(status) {
  return new Promise( resolve => {
      tp.sql("SELECT * FROM [ProjectZero].[dbo].[Volunteers] where status='"+status+"'")
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
