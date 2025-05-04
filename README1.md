{
      after basic setup done
      run 
      `npx sequelize model:generate --name Booking --attributes flightId:integer,userId:integer,status:enum,totalCost:integer`

      now migrate the db
````````npx sequelize db:migrate````````
}

{
      good engineering problems 
      - if(two seats are booked for same flight)
      - if(user tries to book same flight twice)
      - if(one seat & 2 concurrent users try to book same seat)

      we need to handle concurrency issues
      - we can use locks
      - we can use optimistic locking
      - we can use pessimistic locking
      - we can use versioning
      - we can use optimistic concurrency control
      - we can use pessimistic concurrency control
      
}

{
      we need to handle ACID properties
      - Atomicity(we either want  to complete the statement or non of them  we  never want an intermediate state)
      states of transaction{
            -begin(when the state is just started)
            -commit(all the cahnges are applied successfully)
            -rollback(something happening in between  them  )
      }
      - Consistency(data stored in DB is always valid & in a concistent state )
      - Isolation(it is an abilty of multiple transactions to run concurrently without interfering with each other)
      - Durability(if something happens to the database, it should be able to recover from it)
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
