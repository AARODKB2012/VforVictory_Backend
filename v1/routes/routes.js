const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const controller = require('../controllers/main');
const emailController = require('../controllers/email');

app.use(bodyParser.json());

//Add GET endpoints here
router.get('/helloWorld',controller.getHelloWorld);
router.get('/volunteer',controller.getAllVolunteers);
router.get('/family',controller.getAllFamily);
router.get('/volunteer/:userName/password/:password',controller.getVolunteerByUserNameAndPassword);
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

router.get('/service',controller.getAllServices);
router.get('/service/active',controller.getActiveServices);
router.get('/service/rendered',controller.getRenderedServices);

//Add POST endpoint here
router.post('/volunteer/new',controller.createNewVolunteer);
router.post('/volunteer/edit',controller.updateVolunteer);
router.post('/volunteer/change_password/:passwordHash/:volunteerId',controller.changeVolunteerPassword);

router.post('/business/new', controller.createNewBusiness);
router.post('/budget/new', controller.createNewBudget);

router.post('/service/new',controller.createNewRequest);
router.post('/service/fulfill',controller.fulfillRequest);


// Email Functions
router.post('/email/send',emailController.sendEmail);

// Will catch all not defined routes
router.get('*', controller.getNotFound);

module.exports = router;
