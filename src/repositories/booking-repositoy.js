const {StatusCodes} = require('http-status-codes');
const  { Booking } = require('../models');  
const CrudRepository = require('./crud-repository'); // ✅ CORRECT
      
const AppError = require("../utils/errors/app-errors");
const { Op } = require('sequelize');
class BookingRepository extends CrudRepository {
       constructor() {
        super(Booking);
       }
}


module.exports = BookingRepository;