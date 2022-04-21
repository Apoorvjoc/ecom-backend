

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
   
    filter(){
        let copyQ = {...this.bigQ};

        //remove unwanted field (deletion from object)
        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        //convetiong our query object to string such that we can apply replace methods
        let stringOfCopyQ = JSON.stringify(copyQ);

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g , m=>`$${m}`)

        // converting back to object

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

        this.base = this.base.find(jsonOfCopyQ);
    }
    pager(resultPerPage){
        let currPage = 1; // by-default
        if(this.bigQ.page){
            currPage = this.bigQ.page;
        }

        let skipVal = resultPerPage * (currPage-1); // if currPage = 2 && resultPerPage = 5 than we will skip = {5 * (2-1) = 5 initial product} similarly if we are in the 1st page obiously we will print 1st 5 product no skip {5*(1-1) = 0} 

        this.base = this.base.limit(resultPerPage).skip(skipVal);

        return this;
    }
}

module.exports = WhereClause;