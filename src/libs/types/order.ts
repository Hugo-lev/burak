import { ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enums";
import { Product } from "./product";
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
  // From aggregations
  orderItems: OrderItem[];
  productData: Product[];
}
export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: ObjectId;
  orderId?: ObjectId;
}
export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus: OrderStatus;
}
export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
}
