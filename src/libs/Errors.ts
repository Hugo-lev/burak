export enum HttpCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  NOT_MODIFIED = 304,
}

export enum Message {
  SOMETHING_WENT_WRONG = "Something went wrong !",
  NO_DATA_FOUND = "No data found !",
  CREATED_FAILED = "Created failed !",
  UPDATE_FAILED = "Update failed !",
  BAD_REQUEST = "Bad Request !",
  UNAUTHORIZED = "Unauthorized !",
  FORBIDDEN = "Forbidden !",
  NOT_FOUND = "Not Found !",
  INTERNAL_SERVER_ERROR = "Internal Server Error !",

  NO_MEMBER_NICK = "No member with this nickname !",
  BLOCKED_USER = "You have been blocked, Contact restaurant",
  USED_NICK_PHONE = "This nickname or phone number is already used !",
  WRONG_PASSWORD = "Wrong password inserted , please try again !",
  NOT_AUTHENTICATED = "You are not logged in !",
}

class Errors extends Error {
  public code: HttpCode;
  public message: Message;

  static standard = {
    code: HttpCode.INTERNAL_SERVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
  };

  constructor(code: HttpCode, message: Message) {
    super();
    this.code = code;
    this.message = message;
  }
}

export default Errors;
