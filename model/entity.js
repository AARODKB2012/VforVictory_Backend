var Connection = require("tedious").Connection;
var ConnectionPool = require("tedious-connection-pool");
var Request = require("tedious").Request;
var TYPES = require("tedious").TYPES;
var tp = require("tedious-promises");
const {resolve} = require("path");
var md5 = require("md5");

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

exports.getVolunteerByUserNameAndPassword = function (userName, password) {
    return new Promise((resolve) => {
        tp.sql("SELECT [record_id] ,[first_name] ,[last_name] ,[username],[role],[email], [status] " + " FROM [dbo].[Volunteers] where username= '" + userName + "' and password=HashBytes('MD5', '" + password + "') and status = 'Active'").execute().then(function (results) { 
          console.log(results);
            resolve(results);
        }).fail(function (err) {
            //console.log(err);
        });
    });
};

// Use this example for when we need to insert something to DB
exports.createNewVolunteer = function (userObject) {
    console.log(userObject);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("INSERT INTO [dbo].[Volunteers] ([first_name], [last_name], [username], [password], [home_phone], [work_phone], [cell_phone], [email], [educational_background], " + " [current_licenses], [emergency_contact_name], [emergency_contact_phone], [emergency_contact_email], [emergency_contact_address], [drivers_license], [social_security], " + " [address], [availability], [role], [status]) " + " VALUES (@FIRST_NAME, @LAST_NAME, @USER_NAME, HashBytes('MD5', @PASSWORD), @HOME_PHONE, @WORK_PHONE, @CELL_PHONE, @EMAIL, @EDUCATION, @LICENSES," + " @EMERGENCY_FIRST_NAME, @EMERGENCY_PHONE, @EMERGENCY_EMAIL, @EMERGENCY_ADDRESS, @DRIVER_LICENSE, @SOCIAL_SECURITY, " + " @ADDRESS, @AVAILABILITY, @ROLE, @STATUS)", function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
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

exports.createNewBusiness = function (businessObject) {
    console.log(businessObject);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("INSERT INTO [dbo].[Businesses] ([business_name],[email],[primary_contact_fName],[primary_contact_lName], " + "[primary_contact_phone_number],[secondary_contact_fName],[secondary_contact_lName],[secondary_contact_phone_number]," + "[address],[Services_Offered],[Service_Area],[Discount_Amount],[Preferred_Method_Contact],[EOY_Receipt]) " + "VALUES (@BUSINESS_NAME, @EMAIL, @PRIMARY_CONTACT_FNAME, @PRIMARY_CONTACT_LNAME, @PRIMARY_CONTACT_PHONE_NUMBER, " + "@SECONDARY_CONTACT_FNAME,@SECONDARY_CONTACT_LNAME, @SECONDARY_CONTACT_PHONE_NUMBER," + "@ADDRESS, @SERVICES_OFFERED, @SERVICE_AREA, @DISCOUNT_AMOUNT, @PREFERRED_METHOD_CONTACT, @EOY_RECEIPT)", function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("BUSINESS_NAME", TYPES.VarChar, businessObject.business_name);
        request.addParameter("EMAIL", TYPES.VarChar, businessObject.email);
        request.addParameter("PRIMARY_CONTACT_FNAME", TYPES.VarChar, businessObject.primary_contact_fName);
        request.addParameter("PRIMARY_CONTACT_LNAME", TYPES.VarChar, businessObject.primary_contact_lName);
        request.addParameter("PRIMARY_CONTACT_PHONE_NUMBER", TYPES.VarChar, businessObject.primary_contact_phone_number);
        request.addParameter("SECONDARY_CONTACT_FNAME", TYPES.VarChar, businessObject.secondary_contact_fName);
        request.addParameter("SECONDARY_CONTACT_LNAME", TYPES.VarChar, businessObject.secondary_contact_lName);
        request.addParameter("SECONDARY_CONTACT_PHONE_NUMBER", TYPES.VarChar, businessObject.secondary_contact_phone_number);
        request.addParameter("ADDRESS", TYPES.VarChar, businessObject.address);
        request.addParameter("SERVICES_OFFERED", TYPES.VarChar, businessObject.Services_Offered);
        request.addParameter("SERVICE_AREA", TYPES.VarChar, businessObject.Service_Area);
        request.addParameter("DISCOUNT_AMOUNT", TYPES.VarChar, businessObject.Discount_Amount);
        request.addParameter("PREFERRED_METHOD_CONTACT", TYPES.NVarChar, businessObject.Preferred_Method_Contact);
        request.addParameter("EOY_RECEIPT", TYPES.VarChar, businessObject.EOY_Receipt);
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

exports.getAllBusinesses = function () {
    return new Promise((resolve) => {
        tp.sql("SELECT * FROM [dbo].[Businesses]").execute().then(function (results) { // console.log(results);
            resolve(results);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

exports.createNewBusiness = function (businessObject) {
    console.log(businessObject);
    pool.acquire(function (err, connection) {
        if (err) {
            console.error(err);
            return;
        }
        // use the connection as normal
        var request = new Request("INSERT INTO [dbo].[Businesses] ([business_name],[email],[primary_contact_fName],[primary_contact_lName], " + "[primary_contact_phone_number],[secondary_contact_fName],[secondary_contact_lName],[secondary_contact_phone_number]," + "[address],[Services_Offered],[Service_Area],[Discount_Amount],[Preferred_Method_Contact],[EOY_Receipt]) " + "VALUES (@BUSINESS_NAME, @EMAIL, @PRIMARY_CONTACT_FNAME, @PRIMARY_CONTACT_LNAME, @PRIMARY_CONTACT_PHONE_NUMBER, " + "@SECONDARY_CONTACT_FNAME,@SECONDARY_CONTACT_LNAME, @SECONDARY_CONTACT_PHONE_NUMBER," + "@ADDRESS, @SERVICES_OFFERED, @SERVICE_AREA, @DISCOUNT_AMOUNT, @PREFERRED_METHOD_CONTACT, @EOY_RECEIPT)", function (err, rowCount) {
            if (err) {
                console.error(err);
                return;
            }
            // release the connection back to the pool when finished
            connection.release();
        });
        request.addParameter("BUSINESS_NAME", TYPES.VarChar, businessObject.business_name);
        request.addParameter("EMAIL", TYPES.VarChar, businessObject.email);
        request.addParameter("PRIMARY_CONTACT_FNAME", TYPES.VarChar, businessObject.primary_contact_fName);
        request.addParameter("PRIMARY_CONTACT_LNAME", TYPES.VarChar, businessObject.primary_contact_lName);
        request.addParameter("PRIMARY_CONTACT_PHONE_NUMBER", TYPES.VarChar, businessObject.primary_contact_phone_number);
        request.addParameter("SECONDARY_CONTACT_FNAME", TYPES.VarChar, businessObject.secondary_contact_fName);
        request.addParameter("SECONDARY_CONTACT_LNAME", TYPES.VarChar, businessObject.secondary_contact_lName);
        request.addParameter("SECONDARY_CONTACT_PHONE_NUMBER", TYPES.VarChar, businessObject.secondary_contact_phone_number);
        request.addParameter("ADDRESS", TYPES.VarChar, businessObject.address);
        request.addParameter("SERVICES_OFFERED", TYPES.VarChar, businessObject.Services_Offered);
        request.addParameter("SERVICE_AREA", TYPES.VarChar, businessObject.Service_Area);
        request.addParameter("DISCOUNT_AMOUNT", TYPES.VarChar, businessObject.Discount_Amount);
        request.addParameter("PREFERRED_METHOD_CONTACT", TYPES.NVarChar, businessObject.Preferred_Method_Contact);
        request.addParameter("EOY_RECEIPT", TYPES.VarChar, businessObject.EOY_Receipt);
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