// const axios = require('axios');
// const { StatusCodes } = require('http-status-codes');
// const { BookingRepository } = require('../repositories');
// const { ServerConfig, Queue } = require('../config')
// const db = require('../models');
// const AppError = require('../utils/errors/app-errors');
// const {Enums} = require('../utils/common');
// const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;
// const { lockSeat, releaseSeat } = require("./seat-locker");

// const bookingRepository = new BookingRepository();

// async function createBooking(data) {
//     const transaction = await db.sequelize.transaction();
//     try {

//         const flight = await axios.get(`http://localhost:3000/api/v1/flights/${data.flightId}`);
//         const flightData = flight.data.data;
//         if(data.noOfSeats > flightData.totalSeats) {
//             throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
//         }
//          const totalBillingAmount = data.noOfSeats * flightData.price;
//          const bookingPayload = {...data, totalCost: totalBillingAmount};
//          const booking = await bookingRepository.create(bookingPayload, transaction);

//         await axios.patch(`http://localhost:3000/api/v1/flights/${data.flightId}/seats`, {
//             seats: data.noOfSeats
//         });

//         await transaction.commit();

//         return booking;
//     } catch(error) {
//         await transaction.rollback();
//         throw error;
//     }

// }

// async function makePayment(data) {
//         const transaction = await db.sequelize.transaction();
//         try {
//             const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
//             if(bookingDetails.status == CANCELLED) {
//                 throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
//             }
//             console.log(bookingDetails);
//             const bookingTime = new Date(bookingDetails.createdAt);
//             const currentTime = new Date();
//             if(currentTime - bookingTime > 1800000) {
//                 await cancelBooking(data.bookingId);
//                 throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
//             }
//             if(bookingDetails.totalCost != data.totalCost) {
//                 throw new AppError('The amount of the payment doesnt match', StatusCodes.BAD_REQUEST);
//             }
//             if(bookingDetails.userId != data.userId) {
//                 throw new AppError('The user corresponding to the booking doesnt match', StatusCodes.BAD_REQUEST);
//             }
//             // we assume here that payment is successful
//             await bookingRepository.update(data.bookingId, {status: BOOKED}, transaction);

//             Queue.sendData({
//                 content : `Booking Successfully done For the FLight ${data.bookingId}`,
//                 subject : `Flight Booked`,
//                 recepientEmail : 'swainlucky868@gmail.com',
//             })

//             await transaction.commit();

//         } catch(error) {
//             await transaction.rollback();
//             throw error;
//         }
// }

// async function cancelBooking(bookingId) {
//         const transaction = await db.sequelize.transaction();
//         try {
//             const bookingDetails = await bookingRepository.get(bookingId, transaction);
//             console.log(bookingDetails);
//             if(bookingDetails.status == CANCELLED) {
//                 await transaction.commit();
//                 return true;
//             }
//             await axios.patch(`http://localhost:3000/api/v1/flights/${bookingDetails.flightId}/seats`, {
//                 seats: bookingDetails.noOfSeats,
//                 dec: false,
//             });
//             await bookingRepository.update(bookingId, {status: CANCELLED}, transaction);
//             await transaction.commit();

//         } catch(error) {
//             await transaction.rollback();
//             throw error;
//         }
// }

// async function cancelOldBookings() {
//         try {
//             console.log("Inside service")
//             const time = new Date( Date.now() - 1000 * 300 ); // time 5 mins ago
//             const response = await bookingRepository.cancelOldBookings(time);

//             return response;
//         } catch(error) {
//             console.log(error);
//         }
// }

// module.exports = {
//     createBooking,
//     makePayment,
//     cancelBooking,
//     cancelOldBookings,
// }

const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const { BookingRepository } = require("../repositories");
const { Queue } = require("../config");
const db = require("../models");
const AppError = require("../utils/errors/app-errors");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

const {
  lockSeat,
  releaseSeat,
  saveBookingSeats,
  getBookingSeats,
  deleteBookingSeats,
} = require("./seat-locker");

const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  const lockedSeats = [];

  try {
    // 🔒 Lock selected seats
    for (const seat of data.seats) {
      const locked = await lockSeat(
        data.flightId,
        seat.row,
        seat.col,
        data.userId,
      );

      if (!locked) {
        throw new AppError(
          `Seat ${seat.row}${seat.col} is already locked`,
          StatusCodes.CONFLICT,
        );
      }

      lockedSeats.push(seat);
    }

    const flight = await axios.get(
      `http://localhost:3000/api/v1/flights/${data.flightId}`,
    );

    const flightData = flight.data.data;

    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }

    const totalBillingAmount = data.noOfSeats * flightData.price;

    const booking = await bookingRepository.create(
      {
        flightId: data.flightId,
        userId: data.userId,
        noOfSeats: data.noOfSeats,
        totalCost: totalBillingAmount,
      },
      transaction,
    );

    // 🔐 Save seat selection in Redis
    await saveBookingSeats(booking.id, data.seats);

    await axios.patch(
      `http://localhost:3000/api/v1/flights/${data.flightId}/seats`,
      { seats: data.noOfSeats },
    );

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();

    // 🔓 Release locked seats
    for (const seat of lockedSeats) {
      await releaseSeat(data.flightId, seat.row, seat.col);
    }

    throw error;
  }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();

  try {
    const booking = await bookingRepository.get(data.bookingId, transaction);

    if (booking.status === CANCELLED) {
      throw new AppError("Booking expired", StatusCodes.BAD_REQUEST);
    }

    if (booking.totalCost !== data.totalCost) {
      throw new AppError("Payment amount mismatch", StatusCodes.BAD_REQUEST);
    }

    if (booking.userId !== data.userId) {
      throw new AppError("User mismatch", StatusCodes.BAD_REQUEST);
    }

    await axios.post("http://localhost:3000/api/v1/seats/book", {
      flightId: booking.flightId,
      seats: data.seats, // row + col
    });

    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction,
    );

    // 🔓 Release seat locks
    const seats = await getBookingSeats(data.bookingId);
    for (const seat of seats) {
      await releaseSeat(booking.flightId, seat.row, seat.col);
    }

    await deleteBookingSeats(data.bookingId);

    Queue.sendData({
      content: `Booking confirmed: ${data.bookingId}`,
      subject: "Flight Booked",
      recepientEmail: "swainlucky868@gmail.com",
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();

  try {
    const booking = await bookingRepository.get(bookingId, transaction);

    if (booking.status === CANCELLED) {
      await transaction.commit();
      return true;
    }

    await bookingRepository.update(
      bookingId,
      { status: CANCELLED },
      transaction,
    );

    const seats = await getBookingSeats(bookingId);
    for (const seat of seats) {
      await releaseSeat(booking.flightId, seat.row, seat.col);
    }

    await deleteBookingSeats(bookingId);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
};