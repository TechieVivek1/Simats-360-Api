const express = require('express')
const app = express()
const body = require('body-parser')
const con = require('./config')

require('dotenv').config()

app.use(express.json())
app.use(body.json())
// app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 2000;

try{
  con.connect((err)=>{

    if (err) {
     return console.log(err)
    }

    console.log("Connected to DB")

  })

}catch(err){
  console.log("Error on connecting DB",err.message)
}

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: 'Invalid JSON format' });  
  }
  next(err);  
});

// routes 

const EmployeeRoutes = require('../Simats-360-Api/route/employee_route').default

app.use('/employee',EmployeeRoutes)


app.get('/', function (req, res) {
  res.status(200).json({   
    "status": true,
    "message" : "Simats 360"})
})

app.listen(port, function(){
  console.log(`Server is running on port ${port}`) 
})
