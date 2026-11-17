import OrderItemModel from "../schema/Orderitem.model";
import OrderModel from "../schema/Order.model";
import { Member } from "../libs/types/member";
import { Order, OrderItemInput } from "../libs/types/order";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { OrderInquiry } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enums";
import { OrderUpdateInput } from "../libs/types/order";
import MemberService from "./Members.service";
class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
  }

  public async createOrder(
    member: Member,
    input: OrderItemInput[],
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id); // ✅ Foydalanuvchi ID sini ObjectId ga aylantirish
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity; // ✅ Har bir mahsulot narxi * sonini yig`ib umumiy summani hisoblash
    }, 0);
    const delivery = amount < 100 ? 5 : 0; // ✅ Agar buyurtma summasi 100$ dan kam bo`lsa yetkazib berish 5$, aks holda bepul (0$)

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery, // ✅ Umumiy summa + yetkazib berish haqi
        orderDelivery: delivery, // ✅ Yetkazib berish narxi
        memberId: memberId, // ✅ Buyurtma egasining ID si
      });
      const orderId = newOrder._id; // ✅ Yangi yaratilgan buyurtmaning ID si
      console.log("orderId:", orderId);
      await this.recordOrderItem(orderId, input); // ✅ Buyurtma ichidagi har bir mahsulotni orderItems kolleksiyasiga yozish
      // ❌ ESKI: "// create order items" izohi shu yerda edi, o'chirildi

      return newOrder; // ✅ Yangi buyurtmani qaytarish
    } catch (err) {
      console.log("Error, model:createOrder:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[],
  ): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId; // ✅ Qaysi buyurtmaga tegishli ekanligini biriktirish
      item.productId = shapeIntoMongooseObjectId(item.productId); // ✅ Mahsulot ID sini ObjectId ga o`tkazish
      await this.orderItemModel.create(item); // ✅ Bitta buyurtma elementi sifatida DB ga saqlash
      return "INSERTED";
    });

    console.log("promisedList:", promisedList);
    const orderItemsState = await Promise.all(promisedList); // ✅ Barcha elementlar to`liq saqlanishini kutish
    console.log("orderItemsState:", orderItemsState);
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry,
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectId(member._id); // ✅ Foydalanuvchi ID sini ObjectId ga aylantirish
    const matches = { memberId: memberId, orderStatus: inquiry.orderStatus }; // ✅ Faqat shu foydalanuvchi va so`ralgan statusdagi buyurtmalar

    const result = await this.orderModel
      .aggregate([
        { $match: matches }, // ✅ 1. Foydalanuvchi va status bo`yicha filtrlash
        { $sort: { updatedAt: -1 } }, // ✅ 2. Eng oxirgi yangilanganlarini birinchi qilib saralash
        { $skip: (inquiry.page - 1) * inquiry.limit }, // ✅ 3. Sahifalash uchun kerakli buyurtmalarni o`tkazib yuborish
        { $limit: inquiry.limit }, // ✅ 4. Bitta sahifada ko`rsatiladigan buyurtmalar soni
        {
          $lookup: {
            // ✅ 5-QADAM: orderItems kolleksiyasi bilan bog`lash (JOIN)
            // Maqsad: Har bir buyurtma (order) ga tegishli mahsulot elementlarini topish
            from: "orderItems", // Qaysi kolleksiyadan qidiramiz → orderItems
            localField: "_id", // orders kolleksiyasidagi _id maydoni (joriy buyurtmaning ID si)
            foreignField: "orderId", // orderItems dagi orderId maydoni bilan taqqoslanadi
            // Natija: orders._id === orderItems.orderId bo`lgan barcha yozuvlar tanlanadi
            as: "orderItems", // Topilgan elementlar "orderItems" nomli massiv sifatida qo`shiladi
          },
        },
        {
          $lookup: {
            // ✅ 6-QADAM: products kolleksiyasi bilan bog`lash (JOIN)
            // Maqsad: Har bir orderItem ichidagi productId ga mos mahsulot ma`lumotlarini olish
            from: "products", // Qaysi kolleksiyadan qidiramiz → products
            localField: "orderItems.productId", // 5-qadamda qo`shilgan orderItems massividagi productId lar
            // MongoDB massiv ichidagi maydonni ham qidira oladi (array unwinding shart emas)
            foreignField: "_id", // products kolleksiyasidagi _id bilan taqqoslanadi
            // Natija: orderItems[].productId === products._id bo`lgan barcha mahsulotlar tanlanadi
            as: "productData", // Topilgan mahsulotlar "productData" nomli massiv sifatida qo`shiladi
          },
        },
      ])
      .exec();

    // ❌ ESKI: if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    // ✅ YANGI: bo'sh massiv ham tekshiriladi
    if (!result.length)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result; // ✅ To`liq tarkibli buyurtmalar ro`yxatini qaytarish
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput,
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id), // ✅ Foydalanuvchi ID sini ObjectId ga o`tkazish
      orderId = shapeIntoMongooseObjectId(input.orderId), // ✅ Buyurtma ID sini ObjectId ga o`tkazish
      orderStatus = input.orderStatus; // ✅ Yangi status (PAUSE, PROCESS, FINISH)

    const result = await this.orderModel
      .findOneAndUpdate(
        {
          memberId: memberId, // ✅ Faqat shu buyurtmaning haqiqiy egasi o`zgartira oladi
          _id: orderId,
        },
        { orderStatus: orderStatus }, // ✅ Yangi statusni yozish
        { new: true }, // ✅ Yangilangan holatdagi hujjatni qaytarish
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    if (orderStatus === OrderStatus.PROCESS)
      // ✅ Agar buyurtma PROCESS (to`lov qilindi) holatiga o`tsa
      await this.memberService.addUserPoint(member, 1); // ✅ Foydalanuvchiga 1 ball qo`shib berish

    return result; // ✅ Yangilangan buyurtmani qaytarish
  }
}

export default OrderService;
