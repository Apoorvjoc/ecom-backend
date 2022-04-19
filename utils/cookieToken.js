const cookieToken = (user , res , message = "")=>{

    const token = user.getJwtToken();

        const options = {
            // expires: new Date(
            //     Date.now()+process.env.COOKIE_TIME*24*60*60*1000
            // ),
            //
            
            httpOnly:true
        }
        user.password = undefined;
        res.status(200).cookie('token' , token , options).json({   // json is send here b/c we in mobile cookie are not acceptable therefore json respond should be sent
            success:true,
            message : message,
            token,
            user,
        })

}




module.exports = cookieToken;