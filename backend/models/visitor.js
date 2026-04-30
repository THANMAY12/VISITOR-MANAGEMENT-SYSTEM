const mongoose=require('mongoose')

const visitorSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    
    email:{
        type:String,
        required:true,
    
    },
    phone:{
            type:String,
            required:true
    },
    photo:String,
    company:String,
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
    },
    status: {
    type: String,
    enum: ["pending", "approved"],
    default: "approved"
  }

},{
    timestamps:true
}
);

module.exports=mongoose.model("Visitor",visitorSchema)