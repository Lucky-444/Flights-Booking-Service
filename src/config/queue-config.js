// const amqplib = require("amqplib");

 let channel, connection;

// async function connectQueue() {
//     try {
//         connection = await amqplib.connect("amqp://localhost");
//         channel = await connection.createChannel();

//         await channel.assertQueue("noti-queue");
//     } catch(error) {
//         console.log(error);
//     }
// }

// async function sendData(data) {
//     try {
//         await channel.sendToQueue("noti-queue", Buffer.from(JSON.stringify(data)));

//     } catch(error) {
//         console.log("queue error", error);
//     }
// }


const amqplib = require('amqplib');

async function connectQueue() {
    try {
       connection = await amqplib.connect("amqp://localhost");
       channel = await connection.createChannel();

      await channel.assertQueue("noti-queue");
     
    } catch (error) {
        console.log("queue error", error);
        
    }
}

async function sendData(data) {
    try {
       await channel.sendToQueue("noti-queue", Buffer.from(JSON.stringify(data)));
        // data is send if server is down 
        // then data is stored in Buffer queue
        // when server is up it starts to collect these data 
        // 
    } catch (error) {
        console.log("queue error", error); 
    }
}

module.exports = {
    connectQueue,
    sendData
}