const product = require('../models/product');
const bigPromise = require('../middleware/bigPromise');
const cloudinary = require('cloudinary');
const CustomError = require('../utils/customError');

exports.addProduct = bigPromise(async(req , res , next)=>{

    let imgArr = [];

    if(!req.files){
        return next(new CustomError('please provide product images.',401));
    }
    if(req.files){
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath,{
                    folder:"products"
                 })
                imgArr.push({
                    id:result.public_id,
                    secure_url:result.secure_url,
                })
        }
    }

    req.body.photos = imgArr;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success:true,
        message:"product creared successfully..",
        product
    })

})