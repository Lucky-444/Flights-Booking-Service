const { BookingService } = require("../services");
const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const AppError = require("../utils/errors/app-errors");
const redisClient = require("../config/redisClient");
const inMemDb = {};// in memory js object 

async function createBooking(req, res) {
        try {
          console.log("Request body:", req.body); 
      
          const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId : req.body.userId,
            noOfSeats : req.body.noOfSeats,
          });
      
          SuccessResponse.data = response;
          return res.status(StatusCodes.OK).json(SuccessResponse);
        } catch (error) {
          console.error("Error in createBooking:", error);
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "Bad request", error: error.message });
        }
}



// async function makePayment(req , res) {
//   try {
//     const response = await BookingService.makePayment({
//       bookingId : req.body.bookingId ,
//       totalCost : req.body.totalCost,
//       userId : req.body.userId,
//     });
  
//     SuccessResponse.data = response;
//     return res.status(StatusCodes.OK).json(SuccessResponse);
//   } catch (error) {
//     ErrorResponse.error = error
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//   }

// }



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

// async function makePayment(req, res) {
//         try {
//             const idempotencyKey = req.headers['x-idempotency-key'];
//             if(!idempotencyKey ) {
//                 return res
//                     .status(StatusCodes.BAD_REQUEST)
//                     .json({message: 'idempotency key missing'});
//             }
//             if(inMemDb[idempotencyKey]) {
//                 return res
//                     .status(StatusCodes.BAD_REQUEST)
//                     .json({message: 'Cannot retry on a successful payment'});
//             } 
//             const response = await BookingService.makePayment({
//                 totalCost: req.body.totalCost,
//                 userId: req.body.userId,
//                 bookingId: req.body.bookingId
//             });
//             inMemDb[idempotencyKey] = idempotencyKey;
//             SuccessResponse.data = response;
//             return res
//                     .status(StatusCodes.OK)
//                     .json(SuccessResponse);
//         } catch(error) {
//             console.log(error);
//             ErrorResponse.error = error;
//             return res
//                     .status(StatusCodes.INTERNAL_SERVER_ERROR)
//                     .json(ErrorResponse);
//         }
// }


async function makePayment(req, res) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];

    if (!idempotencyKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "idempotency key missing" });
    }

    // 🔥 CHECK REDIS INSTEAD OF inMemDb
    const existingKey = await redisClient.get(`payment:${idempotencyKey}`);

    if (existingKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cannot retry on a successful payment" });
    }

    const response = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });

    // ✅ STORE IDEMPOTENCY KEY IN REDIS WITH TTL
    await redisClient.setEx(
      `payment:${idempotencyKey}`,
      86400, // 24 hours (you can reduce to 1800 if you want)
      "SUCCESS",
    );

    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}
      

module.exports = {
  createBooking,
  makePayment,
};
