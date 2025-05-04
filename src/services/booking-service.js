const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const { BookingRepository } = require("../repositories");
const db = require("../models");
const AppError = require("../utils/errors/app-errors");

async function createBooking(data) {

    return new Promise((resolve, reject) => {
        const result = db.sequelize.transaction(async function bookingImpl(t) {
            const flight = await axios.get(
              `http://localhost:3000/api/v1/flights/${data.flightId}`
            );
      
            const flightData = flight.data.data;
            if (data.noOfSeats > flightData.totalSeats) {
             reject (new AppError("seats Exceeded Limit ", StatusCodes.BAD_REQUEST));
            }
            console.log(flight.data);
            resolve(true);
          });


    })
   
  
}

module.exports = {
  createBooking,
};
