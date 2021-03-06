const express = require('express');
const{addProduct , getAllProduct, adminGetAllProduct, getOneProduct, adminUpdateOneProduct, adminDeleteOneProduct} = require('../controller/productController');
const router = express.Router();
const {isLoggedIn , customRole} = require('../middleware/user')

//user routes
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getOneProduct);

//admin routes
router.route("/admin/product/add").post(isLoggedIn, customRole('admin') ,addProduct);
router.route("/admin/products").get(isLoggedIn , customRole("admin") , adminGetAllProduct) ;
router.route("/admin/products/:id")
    .put(isLoggedIn , customRole("admin") , adminUpdateOneProduct)
    .delete(isLoggedIn , customRole("admin") , adminDeleteOneProduct)

module.exports = router;