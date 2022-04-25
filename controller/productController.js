const Product = require('../models/product');
const bigPromise = require('../middleware/bigPromise');
const cloudinary = require('cloudinary');
const CustomError = require('../utils/customError');
const WhereClause = require('../utils/whereClause');

exports.addProduct = bigPromise(async(req , res , next)=>{

    let imgArr = [];

    if(!req.files){
        return next(new CustomError('please provide product images.',401));
    }
    // console.log("Before file upload....");
 
   try {
    if(req.files){
        console.log("inside if");
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                    folder:"products"
                 })
                imgArr.push({
                    id:result.public_id,
                    secure_url:result.secure_url,
                })
        }
    }
   } catch (error) {
       console.log("Error at file upload: "+ errorc);
   }
//    console.log("after file upload....");
    req.body.photos = imgArr;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success:true,
        message:"product created successfully..",
        product
    })

})

exports.getAllProduct = bigPromise(async(req,res,next)=>{
    const resultPerPage = 6;//lets say by default we want to display 6 result only.
    const totalProductCount = await Product.countDocuments();

    const productsObj = new WhereClause(Product.find() , req.query).search().filter();

    let products = await productsObj.base; 
    const filteredProductNumber = products.length;

    productsObj.pager(resultPerPage)

    products = await productsObj.base.clone();

    res.status(200).json({
        success:true,
        message:"All products extracted successfully..",
        products,
        filteredProductNumber,
        totalProductCount
    })
})