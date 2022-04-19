const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true , 'please provide a name.'],
        maxlength:[40 , 'name should be under 40 characters.'],
        trim:true,
    },
    email:{
        type:String,
        required:[true , 'please provide email'],
        validate:[validator.isEmail , 'please enter valid email'],
        unique:true
    },
    mobile:{
        type:Number,
        required:[true , 'please provide phone number.'],
        min:[10 , 'please enter valid phone number.'],
    },
    password:{
        type:String,
        required:[true , 'please provide password'],
        minlength:[4 , 'password should be atleast 4 charater.'],
        select:false, // when we were passing the object at that time the password was also travelling 
        //so to avoid that we are using this select prop and agr hmko password kabhi chaiye hoga to hmko explicitly batana krna padega.
        //another method is putting password undefined.
    },
    role:{
        type:String,
        default:'user'
    },
    photo:{
        id:{
            type:String,
            required:[true , 'please provide the photo id'],
        },
        secure_url:{
            type:String,
            required:[true , 'please provide the photo url'],
        }
    },
    forgotPasswordToken:String,
    forgotPasswordExpirey:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
})


//encrypt pass before save - Hooks

//jo ye this hai usse hm userschema ke koi bhi property ko access kr skte hai.
userSchema.pre('save' , async function(next){

    if(!this.isModified('password'))return next(); // if no changes in password next otherwise hash kro

    this.password = await bcrypt.hash(this.password , 10);//hashing password here.
})

//validating password methods (passing methods in schema by ourself)
userSchema.methods.isValidatedPassword = async function(userSendPassword){
    return await bcrypt.compare(userSendPassword , this.password);
}

//create and retuen jwtToken
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id} , process.env.JWT_SECRET , {
        // expiresIn:JWT_EXPIRE,
    })
}

userSchema.methods.getForgotPassword = function(){
    const forgotToken = crypto.randomBytes(20).toString('hex'); //--> forgot password token aur isi ki hm user ko bhejenge(like otp) and then uske bad hm hashed value ko db me save krenge aur jo otp hai usko hash krke db se puchenge shi hai ki ni 

    // this.forgotPasswordToken = forgotPassword; --->aisa krna tha but hm kha pr isko hash krnege.
   
    //this hashed forgot password will be stored in the hash into the db; 
    this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(forgotToken)
    .digest('hex');

    this.forgotPasswordExpirey = Date.now() + 20*60*1000; // 20 min keliye valid hoga token
    
    return forgotToken;
}

module.exports = mongoose.model('User' , userSchema);

