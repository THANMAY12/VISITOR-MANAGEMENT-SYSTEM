const dotenv=require('dotenv')
const express=require('express')
const cors=require('cors')
dotenv.config();
const authRoutes=require('./routes/authRoutes')
const connectToDB=require('./config/db')
const visitorsRoutes=require('./routes/visitorRoutes')
const appointmentRoutes=require('./routes/appointmentRoutes')
const passRoutes=require('./routes/passRoutes')
const checkRoutes=require('./routes/checkRoutes')
const uploadRoutes = require("./routes/uploadRoutes");

connectToDB()


const app=express()

app.use(express.json())

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use("/api/auth",authRoutes)
app.use("/api/visitors",visitorsRoutes);
app.use("/api/appointments",appointmentRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/check",checkRoutes)
app.use("/api/upload",uploadRoutes);
app.get("/",(req,res)=>{
    res.status(200).json({
    message:"Api running"
    })
})



const PORT=process.env.PORT;
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`)
})


