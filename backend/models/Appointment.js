const mongoose=require('mongoose');

const appointmentSchema=new mongoose.Schema({
    visitorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Visitor",
        required:true
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date:{
        type:Date,
        required:true
    },purpose:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"pending"
    },
    passId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pass"
    }
}
,{
    timestamps:true
});

module.exports=mongoose.model("Appointment",appointmentSchema)