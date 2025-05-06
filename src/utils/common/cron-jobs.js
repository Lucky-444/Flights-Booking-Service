const cron = require('node-cron');

const { BookingService } = require('../../services');

function scheduleCrons() {
    cron.schedule('*/30 * * * *', async () => {
        //every 30 mins it works and cancelled the old bookings         
         await BookingService.cancelOldBookings();
    });
}

module.exports = scheduleCrons;