const { BookingService } = require("../services");
const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const AppError = require("../utils/errors/app-errors");


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
      

module.exports = {
  createBooking,
};
