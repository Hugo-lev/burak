export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = `:method :url :status :response-time ms \n`;

import mongoose from "mongoose";
export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};
