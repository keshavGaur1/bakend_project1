class ApiResponse {
  constructor(statuscode , data, message="Success" ) {
    this.data = data;
    this.message = message;
    this.statuscode = statuscode;
    this.success = statuscode<400;
  }
} 

export {ApiResponse};