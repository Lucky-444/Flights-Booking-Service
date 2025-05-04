const express = require('express');
const { InfoController } = require('../../controllers');
const bookingsTACK = require('./booking');

const router = express.Router();
const app = express();


router.get('/info', InfoController.info);
router.use('/bookings', bookingsTACK); // Mounts POST and GET

module.exports = router;
