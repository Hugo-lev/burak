import { ExtendedRequest } from "../libs/types/member";
import { T } from "../libs/types/common";
import { Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import OrderService from "../models/Order.service";
import { OrderInquiry } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enums";
import { OrderUpdateInput } from "../libs/types/order";
const orderService = new OrderService();

const orderController: T = {};

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder");
    const result = await orderService.createOrder(req.member, req.body); // ✅ Foydalanuvchi va uning tanlagan buyurtma elementlarini service ga uzatish

    res.status(HttpCode.CREATED).json(result); // ✅ Yangi yaratilgan buyurtmani 201 CREATED statusi bilan qaytarish
  } catch (err) {
    console.log("Error, createOrder:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};
orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyOrders");
    const { page, limit, orderStatus } = req.query; // ✅ Query dan sahifalash va buyurtma holatini olish
    const inquiry: OrderInquiry = {
      page: Number(page), // ✅ Sahifa raqamini songa aylantirish
      limit: Number(limit), // ✅ Sahifa hajmini songa aylantirish
      orderStatus: orderStatus as OrderStatus, // ✅ Buyurtma statusini (PAUSE, PROCESS, FINISH) biriktirish
    };

    console.log("inquiry:", inquiry);
    const result = await orderService.getMyOrders(req.member, inquiry); // ✅ Foydalanuvchining o`z buyurtmalarini service orqali olish

    res.status(HttpCode.CREATED).json(result); // ✅ Buyurtmalar ro`yxatini qaytarish
  } catch (err) {
    console.log("Error, getMyOrders:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};
orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateOrder");
    const input: OrderUpdateInput = req.body; // ✅ Body dan orderId va yangilanadigan yangi orderStatus ni olish
    const result = await orderService.updateOrder(req.member, input); // ✅ Buyurtmani yangilash va ball qo`shish logikasini chaqirish

    res.status(HttpCode.CREATED).json(result); // ✅ Yangilangan buyurtmani qaytarish
  } catch (err) {
    console.log("Error, updateOrder:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default orderController;
