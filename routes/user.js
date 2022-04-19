const express = require('express');
const router = express.Router();

//importing all controllers
const {
    signup , 
    login, 
    logout, 
    forgotPassword, 
    forgotPasswordReset, 
    getLoggedInUserDetails, 
    changePassword, 
    updateUserDetails,
    adminAllUsers,
    salesAllUsers,
    adminGetOneUser,
    adminUpdateUser,
    adminDeleteUser
} = require('../controller/userController');

//middlewares
const { isLoggedIn, customRole } = require('../middleware/user');

//all routes 
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout)
router.route("/forgotPassword").post(forgotPassword)
router.route("/password/reset/:token").post(forgotPasswordReset)
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails)//injecting middleware between as if user loggded in or not
router.route("/password/update").post(isLoggedIn, changePassword)
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails)

router.route("/admin/users").get(isLoggedIn , customRole('admin') , adminAllUsers);
router
    .route("/admin/user/:id")
    .get(isLoggedIn , customRole('admin') , adminGetOneUser)
    .put(isLoggedIn , customRole('admin') ,adminUpdateUser)
    .delete(isLoggedIn , customRole('admin') , adminDeleteUser)

//sales routes
router.route("/sales/users").get(isLoggedIn , customRole("sale") , salesAllUsers)

module.exports = router
