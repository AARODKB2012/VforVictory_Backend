const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");

const controller = require('../controllers/main');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//Add GET endpoints here
router.get('/helloWorld',controller.getHelloWorld);
router.get('/volunteer',controller.getAllVolunteers);
router.get('/volunteer/:userName/password/:password',controller.getVolunteerByUserNameAndPassword);
router.get('/volunteer/status/:status',controller.getAllVolunteersByStatus);
router.get('/volunteer/search/:searchValue',controller.getAllVolunteersBySearchValue);
<<<<<<< Updated upstream
=======
router.get('/volunteer/id/:volunteerId',controller.getVolunteerById);
router.get('/volunteer/email/:volunteerEmail',controller.getVolunteerByEmail);
router.get('/volunteer/username/:username',controller.getVolunteerByUsername);
router.get('/volunteer/education/',controller.getAllEducations);
router.get('/volunteer/role/',controller.getAllRoles);
>>>>>>> Stashed changes
router.get('/business',controller.getAllBusinesses);

//Add POST endpoint here
router.post('/volunteer/new',controller.createNewVolunteer);
<<<<<<< Updated upstream
router.post('/business/new',controller.createNewBusiness);
=======
router.post('/volunteer/edit',controller.updateVolunteer);
router.post('/volunteer/change_password/:passwordHash/:volunteerId',controller.changeVolunteerPassword);
router.post('/business/new',controller.createNewBusiness);

// Email Functions
router.post('/email/send',emailController.sendEmail);
>>>>>>> Stashed changes

//Will catch all not defined routes
router.get('*',controller.getNotFound);

module.exports = router;
