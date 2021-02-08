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
router.get('/family',controller.getAllFamily);
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
router.get('/budget',controller.getAllBudgets);
router.get('/volunteer/education/',controller.getAllEducations);
router.get('/volunteer/role/',controller.getAllRoles);
router.get('/volunteer/username/:username/profile/picture',controller.getProfilePicture);
router.get('/volunteer/login/history/:userId',controller.getLoginHistory);

router.get('/service',controller.getAllServices);
router.get('/service/active',controller.getActiveServices);
router.get('/service/rendered',controller.getRenderedServices);

//Add POST endpoint here
router.post('/volunteer/new',controller.createNewVolunteer);
router.post('/volunteer/edit',controller.updateVolunteer);
router.post('/volunteer/change_password/:passwordHash/:volunteerId',controller.changeVolunteerPassword);
router.post('/volunteer/picture/:username', upload.single('fileKey'),controller.updateProfilePicture);
router.post('/volunteer/login/new',controller.saveLoginHistory);

router.post('/business/new', controller.createNewBusiness);
router.post('/budget/new', controller.createNewBudget);

router.post('/service/new',controller.createNewRequest);
router.post('/service/fulfill',controller.fulfillRequest);

router.post('/family/new',controller.createNewFamily);

// Email Functions
router.post('/email/send',emailController.sendEmail);

// Will catch all not defined routes
router.get('*', controller.getNotFound);

module.exports = router;
