class ApiError extends Error {
    constructor (statusCode,
         message ="Something went wrong",
         errors = [],
         statck=""
        ) {
            // super use kr rhe jisse parent class ke constructor ko call kr ske 
            // isse parent class ka code overright ho jayega
            super(message)
            this.statusCode = statusCode;
            this.data=null; //  Agar tum API me extra details return karna chahte ho, jaise error ke saath koi additional information ya structured response, toh this.data ka use ho sakta hai.
            this.message = message;
            this.success = false;
            this.errors = errors;
            
            // we can avoid it
            if(statck){
                this.stack = statck;
            }
            else{
                Error.captureStackTrace(this, this.constructor);
            }
        }
}

export {ApiError};