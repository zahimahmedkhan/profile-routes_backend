const express = require('express')
const app = express()
require('dotenv').config();
const {appRouter} = require('./router/auth/auth')
const { profileRouter } = require('./router/profile/profile')
const { DBConnection } = require('./config/database')
const cookieParser = require('cookie-parser')
const cors = require('cors')


const Port = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
  "http://localhost:3000",
  "https://authenticated-profile-routes-front.vercel.app"
];

app.use( cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed from this origin: " + origin));
    }
  },
  credentials: true,
}))

app.use('/auth',appRouter)
app.use('/profile',profileRouter)

DBConnection()
  .then(()=>{
    console.log("database connected successfully")
  }).catch((err)=>{
    console.log('database connection failed',err)
})

app.listen(Port,()=>{
    console.log(`Server is running on port localhost:${Port}`)
})
