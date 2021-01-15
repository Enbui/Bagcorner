# Bagcorner
shopping cart project  build by Nodejs and Mongodb


To run this project, download and unzip project and open unzipped in a code editor, as visual studio code
- run this command to turn on mongodb : systemctl start mongod
- then turn on nodejs : npm start
- to show database, run this command line:
      mongo
      use project3
 to show database collections of this project, run this command line :  show collections
 result : 
  discusses
  orders
  products
  reviews
  sessions
  users
  
  to show documents in each collection, run this command line : db.<collection>.find().pretty()
  example :   db.products.find().prety()
