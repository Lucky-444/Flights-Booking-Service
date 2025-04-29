{
      after basic setup done
      run 
      `npx sequelize model:generate --name Booking --attributes flightId:integer,userId:integer,status:enum,totalCost:integer`

      now migrate the db
      `npx sequelize db:migrate`
}