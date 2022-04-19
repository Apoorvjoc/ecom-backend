//we can either use async-await with try and catch --OR--  promises

//here we are using promises

module.exports = (itWillTakeAFunction) => (req , res , next)=>{
    Promise.resolve(itWillTakeAFunction(req , res , next)).catch(next);
}