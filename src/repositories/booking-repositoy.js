const {StatusCodes} = require('http-status-codes');
const {Booking , CrudRepository} = require('../models/index');           
const AppError = require('../utils/errors/app-error');
const { Op } = require('sequelize');
class BookingRepository extends CrudRepository {
       constructor() {
        super(Booking);
       }
}


module.exports = BookingRepository;