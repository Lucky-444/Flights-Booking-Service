const express = require('express');
const router = express.Router();
const { BookingController } = require('../../controllers');

router.post('/', BookingController.createBooking);




//POST /payments/
//in headers pass idempotency key
/**
 *   req.headers ==> {
 *    x-idempotency-key : sa-123-sha-25
 * }
 */
/**
 * req.body = {
 * 
 *              totalCost: req.body.totalCost,
                 userId: req.body.userId,
                bookingId: req.body.bookingId

              }
 */
router.post('/payments' , BookingController.makePayment);




module.exports = router;
