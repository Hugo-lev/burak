import { ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enums";
export interface OrderItem {
  _id: ObjectId;
  itemQuantity: number;
  itemPrice: number;
  productId: ObjectId;
  orderId?: ObjectId;
  createAt: Date;
  updateAt: Date;
}
export interface Order {
  _id: ObjectId;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  memberIt: ObjectId;
  createAt: Date;
  updateAt: Date;
}
export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: ObjectId;
  orderId?: ObjectId;
}
