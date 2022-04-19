

class WhereClause{
    constructor(base , bigQ){
        this.base = base;
        this.bigQ = bigQ;
    }

    search(){
        const searchWord = this.bigQ.search  // we are finding the if search is present in our query or not
        ?{
            name:{
                $regex:this.bigQ.search,
                $options:'i'
            },
        }:{}
        this.base = this.base.find({...searchWord}); // this is similar to db.find(email:{"aj.aj.com"})
        return this
    }
}