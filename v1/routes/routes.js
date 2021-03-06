const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const controller = require('../controllers/main');
const emailController = require('../controllers/email');
var multer  = require('multer')

var storage = multer.diskStorage(
    {
        destination: 'uploads/',
        filename: function ( req, file, cb ) {
            cb( null, file.originalname);
        }
    }
);

var upload = multer( { storage: storage } );

app.use(bodyParser.json());

//Add GET endpoints here
router.get('/helloWorld',controller.getHelloWorld);
router.get('/volunteer',controller.getAllVolunteers);
router.get('/volunteer/:userName/password/:password',controller.getVolunteerByUserNameAndPassword);
router.get('/volunteer/current/:username',controller.getCurrentUser);
router.get('/volunteer/status/:status',controller.getAllVolunteersByStatus);
router.get('/volunteer/search/:searchValue',controller.getAllVolunteersBySearchValue);
router.get('/volunteer/id/:volunteerId',controller.getVolunteerById);
router.get('/volunteer/email/:volunteerEmail',controller.getVolunteerByEmail);
router.get('/volunteer/username/:username',controller.getVolunteerByUsername);
router.get('/volunteer/education/',controller.getAllEducations);
router.get('/volunteer/role/',controller.getAllRoles);
router.get('/business', controller.getAllBusinesses);

router.get('/business/id/:businessId', controller.getBusinessById);
router.get('/business/category', controller.getAllCategories);
router.get('/business/active',controller.getActiveBusinesses);

router.get('/budget',controller.getAllBudgets);
router.get('/volunteer/education/',controller.getAllEducations);
router.get('/volunteer/role/',controller.getAllRoles);
router.get('/volunteer/username/:username/profile/picture',controller.getProfilePicture);
router.get('/volunteer/login/history/:userId',controller.getLoginHistory);

router.get('/service',controller.getAllServices);
router.get('/service/category',controller.getAllCategories);
router.get('/service/list',controller.getActiveServices);
router.get('/service/active',controller.getActiveRequests);
router.get('/service/rendered',controller.getRenderedServices);
router.get('/service/get/id/:serviceId',controller.getServiceById);
router.get('/service/id/:serviceId',controller.getRequestById);

router.get('/family/inactive',controller.getInactiveFamily);
router.get('/family',controller.getAllFamily);

router.get('/family/month',controller.getThisMonthFamilies);
router.get('/family/unapproved',controller.getFamiliesToApprove);
router.get('/service/requested/month',controller.getThisMonthRequests);

router.get('/business/month',controller.getThisMonthBusinesses);
router.get('/business/unapproved',controller.getBusinessesToApprove);


//Add POST endpoint here
router.post('/volunteer/new',controller.createNewVolunteer);
router.post('/volunteer/edit',controller.updateVolunteer);
router.post('/volunteer/change_password/:passwordHash/:volunteerId',controller.changeVolunteerPassword);
router.post('/volunteer/picture/:username', upload.single('fileKey'),controller.updateProfilePicture);
router.post('/volunteer/login/new',controller.saveLoginHistory);

router.post('/business/new', controller.createNewBusiness);
router.post('/business/edit',controller.updateBusiness);

router.post('/budget/new', controller.createNewBudget);

router.post('/service/new',controller.createNewRequest);
router.post('/service/fulfill',controller.fulfillRequest);
router.post('/service/notifyBusiness',controller.markBusinessNotified);
router.post('/service/notifyFamily',controller.markFamilyNotified);
router.post('/service/followupBusiness',controller.markBusinessFollowedUp);
router.post('/service/followupFamily',controller.markFamilyFollowedUp);
router.post('/service/markActive',controller.markServiceActive);
router.post('/service/markInactive',controller.markServiceInactive);
router.post('/service/delete',controller.deleteRequest);



router.post('/family/new',controller.createNewFamily);
router.post('/family/markActive',controller.markFamilyActive);
router.post('/family/markInactive',controller.markFamilyInactive);
router.post('/family/active',controller.getActiveFamily);


// Email Functions
router.post('/email/send',emailController.sendEmail);

// Will catch all not defined routes
router.get('*', controller.getNotFound);

module.exports = router;
