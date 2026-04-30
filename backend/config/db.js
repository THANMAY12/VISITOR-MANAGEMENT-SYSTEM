const mongoose=require('mongoose')

const connectToDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI);
    }
    catch(e){
      console.error(e);
    }
}
module.exports = connectToDB;