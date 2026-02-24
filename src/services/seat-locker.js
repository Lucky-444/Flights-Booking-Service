const redisClient = require("../config/redisClient");

async function lockSeat(flightId, row, col, userId) {
  const key = `seat:${flightId}:${row}:${col}`;
  const result = await redisClient.set(
    key,
    userId,
    { NX: true, EX: 300 }, // 5 minutes
  );
  return result === "OK";
}

async function releaseSeat(flightId, row, col) {
  const key = `seat:${flightId}:${row}:${col}`;
  await redisClient.del(key);
}

async function saveBookingSeats(bookingId, seats) {
  await redisClient.setEx(
    `booking:seats:${bookingId}`,
    1800, // 30 minutes
    JSON.stringify(seats),
  );
}

async function getBookingSeats(bookingId) {
  const data = await redisClient.get(`booking:seats:${bookingId}`);
  return data ? JSON.parse(data) : [];
}

async function deleteBookingSeats(bookingId) {
  await redisClient.del(`booking:seats:${bookingId}`);
}

module.exports = {
  lockSeat,
  releaseSeat,
  saveBookingSeats,
  getBookingSeats,
  deleteBookingSeats,
};
