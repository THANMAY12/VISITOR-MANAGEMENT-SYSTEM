const nodemailer=require('nodemailer')

const sendEmail=async (to,subject,text)=>{
    try {
        const transporter=nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            },
            family: 4
        })
        const mailOptions={
            from:process.env.EMAIL_USER,
            to,subject,text
        }
        await transporter.sendMail(mailOptions)
    } catch (e) {
      console.error(e);
    }
}

module.exports=sendEmail