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

    if(products.length === 0){
        res.status(200).json({
            success:true,
            message:"No products found!!"
        })
    }

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

exports.adminGetAllProduct = bigPromise(async(req , res , next)=>{
    const products = await Product.find();

    if(products.length === 0){
        res.status(200).json({
            success:true,
            message:"No products found!!"
        })
    }

    res.status(200).json({
        success:true,
        message:"All product extracted by admin",
        products
    })
})

exports.getOneProduct = bigPromise(async(req , res , next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomError("No product find by this id" , 400));
    }

    res.status(200).json({
        success:true,
        message:"successfully extracted product",
        product
    })
})

exports.adminUpdateOneProduct = bigPromise(async(req , res , next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomError("no product found by given id" , 400));
    }
    let imagesArray = [];
    //if we are recieving files
    if(req.files){
        //destroy existing images
        for (let index = 0; index < product.photos.length; index++) {
           let res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
        }

        //uploading new images
        for (let index = 0; index < product.photos.length; index++) {
           let result = await cloudinary.v2.uploader.upload(
               req.files.photos[index].tempFilePath,
                    {
                        folder:"products",
                    }
               ) 
            imagesArray.push({
                 id:result.public_id,
                 secure_url:result.secure_url
            });
        }
    }
    // now finally update the product
    req.body.photos = imagesArray;

    product = await Product.findByIdAndUpdate(req.params.id , req.body , {
        new : true,
        runValidators:true,
        useFindAndModify: false
    });

    res.status(200).json({
        success:true,
        message:"updated successfully..",
        product
    })
})

exports.adminDeleteOneProduct = bigPromise(async(req , res , next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomError("no product found by given id" , 401));
    }
    
      //destroy existing images
    for (let index = 0; index < product.photos.length; index++) {
        let res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
     }


     await product.remove();

    res.status(200).json({
        success:true,
        message:"product was deleted successfully..",
        // product
    })
})

exports.addReview = bigPromise(async(req , res , next)=>{
    const {comment , rating , productId} = req.body;

    //here we are creating review exactly same as in model.
    const review = {
        user:req.body._id, // this is coming from middleware.
        name:req.body.name,
        rating:Number(rating),
        comment:comment
    }

    //finding product in which we have to add the review
    const product = await Product.findById(productId);

    const alreadyReviewd = product.rewiews.find(
        (rev)=>rev.user.toString() === req.user._id.toString() // as these are BSON object therefore we have converted it into string.
    )
    //saving comment in db

    //if user has already commented then update the review
    if(alreadyReviewd){

        product.reviews.forEach((review)=>{
            if(review.user.toString() === req.body._id.toString()){
                review.comment = comment,
                review.reting = rating
            }
        })

    }else{ // if it is first comment then push same value
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length;
    }

    //adjust rating
    product.rating = product.reviews.reduce((acc,item)=> item.rating + acc , 0)/product.reviews.length
})



