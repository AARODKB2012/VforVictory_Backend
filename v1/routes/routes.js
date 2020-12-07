const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");

const controller = require('../controllers/main');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Add GET endpoints here
router.get('/helloWorld', controller.getHelloWorld);
router.get('/volunteer', controller.getAllVolunteers);
router.get('/volunteer/:userName/password/:password', controller.getVolunteerByUserNameAndPassword);
router.get('/volunteer/status/:status', controller.getAllVolunteersByStatus);
router.get('/volunteer/search/:searchValue', controller.getAllVolunteersBySearchValue);
router.get('/business', controller.getAllBusinesses);

// Add POST endpoint here
router.post('/volunteer/new', controller.createNewVolunteer);
router.post('/business/new', controller.createNewBusiness);

// Will catch all not defined routes
router.get('*', controller.getNotFound);

module.exports = router;
