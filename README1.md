{
after basic setup done
run
`npx sequelize model:generate --name Booking --attributes flightId:integer,userId:integer,status:enum,totalCost:integer`

      now migrate the db

`npx sequelize db:migrate`
}

{
good engineering problems - if(two seats are booked for same flight) - if(user tries to book same flight twice) - if(one seat & 2 concurrent users try to book same seat)

      we need to handle concurrency issues
      - we can use locks
      - we can use optimistic locking
      - we can use pessimistic locking
      - we can use versioning
      - we can use optimistic concurrency control
      - we can use pessimistic concurrency control


}

{
we need to handle ACID properties - Atomicity(we either want to complete the statement or non of them we never want an intermediate state)
states of transaction{
-begin(when the state is just started)
-commit(all the cahnges are applied successfully)
-rollback(something happening in between them )
} - Consistency(data stored in DB is always valid & in a concistent state ) - Isolation(it is an abilty of multiple transactions to run concurrently without interfering with each other) - Durability(if something happens to the database, it should be able to recover from it)
if any unfarseen circumstance happens we need to rollback the transaction

      transaction is nothing just a set of read and write operations



      begin has two parts{
            1.active{
                  1.partially completed{
                        commit
                  }
                  2.failure{
                        rollback
                  }
            }
      }

}
{
mysql provides locking mechanisms
1.shared lock (this provides multiple transactions to read data at same time but restricts any of them to write on the data )

      2.exclusive lock (this prevents transactions from read or write the same at same time )

      3.intent locks(this used to specify that a transactions planning to read or write a certain section of data)

      4.row-level locks (this allows transactions to only a specific row)

      MVCC data base -> multi version concurrency data base
      mysql is compatible to allow multiple transaction to read or write data on same data
      without much conflict

      Every transaction in mysql captures the data
      it is about to modify at start of transction & writes the changes on entirly diff vcersion of data
      THis allows transaction to continue working with original data without any conflict



}

{
in booking system we use two types of concurrency controll to avoid race condition in DBMS

      1.prismistic concurrency controll({
            1.row level locks

      })
      2.optimistic concurrency controll({
            we can put manual checks for transactions

      })

}

{
now do the interservice communication with flight-service-project & flight-booking-service

      both are running in different server
      {
            inter service communication :: we use axios in our service

      }

}

{
we manually cancel our payment
but if it is more than 5 mins then automatically the transactions would be cancelled
to implement this feature we need
CRON \_ JOBS --> read it from google ostechinix.com

      Node_cron package -
      `npm i cron-jobs`
      run {
      cron.schedule('*/30 * * * *', async () => {
            in every 30 mins it would cancel the old bookings

           await BookingService.cancelOldBookings();
      });
      }

}
-------- COMPLETED the 3 major ENGINEERING PROBLEMS-------------------------

{
now new major issue
client make a payment
and payment got success
and while returning the response something went wrong
client never recieve the notification that the payment make succefull
and the end of client doing double transaction for the same booking

      another issue is that user make two payment request for the same bookings
      one after another definitely the transaction will go happen

      concept callled as idempotency ==> {
            it is the property of certain operatin in math and CS where they can be applied multiple times
            without changing the result beyond first applicatons


            lets say you made a payment request and the payment is done
            but by mistake one more request cameup {
                  only the first request will applied the 2nd request will not show any effect

                  if(first request is not succesfull then then we definitely trying to apply the 2nd request)
            }

            idempotent api => for some error the 2nd request will come up and first request will succesfull
            we are not going to apply the 2nd one 3rd one and beyond that


            if somebody makes 2 payment request the payment will go through once

      }

      we have to send them idempotency key

      if payment actually went through we save the idempotency key inside our server
      before used it we will check the idempotency key is already there or not

}

package called uuid
`npm i uuid`

{
where we stored our idempotency key
we store it in reddis or in memory object

}

{
auto matically generate a new idempotency key how to set up that

ChatGPT said:
To automatically generate a new idempotency key for each request (especially useful for client or test code), you can use a universally unique identifier (UUID). Here's how to do it:

✅ 1. Install UUID package
Use the uuid library to generate unique keys:

bash
Copy
Edit
npm install uuid
✅ 2. Generate and set the key in requests
🔧 Option A: In your backend (useful for internal service-to-service calls)
js
Copy
Edit
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const idempotencyKey = uuidv4();

axios.post('http://localhost:4000/api/v1/payments', payload, {
headers: {
'x-idempotency-key': idempotencyKey
}
});
🔧 Option B: In frontend or Postman
If you're testing with Postman, you can generate one like this in the pre-request script:

js
Copy
Edit
// Pre-request Script in Postman
const uuid = require('uuid');
pm.variables.set("idempotency_key", uuid.v4());
Then use it in your headers tab like this:

css
Copy
Edit
x-idempotency-key: {{idempotency_key}}
✅ 3. (Optional) Log or store the key
If you're using the key for real payments or need traceability, consider storing it along with the booking/payment data in your database, instead of keeping it in in-memory objects (inMemDb), which will reset on app restart.

🔁 Summary
Use uuid.v4() to auto-generate a unique key.

Send that in the x-idempotency-key header.

In your service, you can either:

Allow one-time usage (like now), or

Allow safe retries by comparing payloads.

Would you like me to help you refactor your makePayment logic to better handle idempotency keys with retries?

}
Rabbit Mq is known as message broker
[
      {
                  async function connectQueue() {
                  try {
                  const connect = await amqplib.connect("amqp://localhost")  
                  } catch (error) {
                  console.log(error);

                  }

                  }

                Rabbit Mq setup  : amqp:-is mandatory
      }
]
