# 📘 Burak loyihasi: bugungi (8-noyabr 2026) ish konspekti

> **Repo:** `Hugo-lev/burak` · **Branch:** `devlop`
> **Bugungi commitlar:** 5 ta (12:37 dan 16:17 gacha)
> **Bugungi asosiy maqsad:** **Buyurtma (Order) tizimini** yozish: 2 ta schema, 3 ta REST API va "buyurtma jarayonga o'tganda foydalanuvchiga ball berish".

---

## Mundarija

1. [Bugun nima qilindi? (qisqacha)](#1-bugun-nima-qilindi-qisqacha)
2. [Asos: so'rov qanday yuradi va nega 2 ta collection](#2-asos-sorov-qanday-yuradi-va-nega-2-ta-collection)
3. [Commit 1: `276c921` Schema modellar](#3-commit-1-276c921--schema-modellar)
4. [Commit 2: `e47f96b` createOrder API](#4-commit-2-e47f96b--createorder-api)
5. [Commit 3: `ce59658` getMyOrders API](#5-commit-3-ce59658--getmyorders-api)
6. [Commit 4: `0e550d6` updateOrder API va ball berish](#6-commit-4-0e550d6--updateorder-api-va-ball-berish)
7. [Commit 5: `1d5e7b8` xatolarni tuzatish](#7-commit-5-1d5e7b8--xatolarni-tuzatish)
8. [Hali ochiq turgan muammolar](#8-hali-ochiq-turgan-muammolar)
9. [Postman bilan sinash](#9-postman-bilan-sinash)
10. [Lug'at](#10-lugat)

---

## 1. Bugun nima qilindi? (qisqacha)

| # | Commit | Vaqt | Nima qildi |
|---|--------|------|------------|
| 1 | `276c921` | 12:37 | `Order` va `OrderItem` schema (jadval tuzilmasi) yozildi |
| 2 | `e47f96b` | 13:47 | `POST /order/create`: buyurtma yaratish |
| 3 | `ce59658` | 14:21 | `GET /order/all`: o'z buyurtmalarimni ko'rish |
| 4 | `0e550d6` | 14:55 | `POST /order/update`: status o'zgartirish + ball berish |
| 5 | `1d5e7b8` | 16:17 | Yozuv xatolari va noto'g'ri import/ro'yxatdan o'tkazish tuzatildi |

Bugun o'zgargan fayllar:

```
src/schema/Order.model.ts            ← yangi (buyurtma schema)
src/schema/Orderitem.model.ts        ← yangi (buyurtma ichidagi mahsulot schema)
src/libs/types/order.ts              ← yangi (TypeScript turlari)
src/models/Order.service.ts          ← yangi (biznes mantiq)
src/controllers/order.controller.ts  ← yangi (so'rovni qabul qiluvchi)
src/models/Members.service.ts        ← addUserPoint qo'shildi
src/router.ts                        ← 3 ta yangi yo'l qo'shildi
```

---

## 2. Asos: so'rov qanday yuradi va nega 2 ta collection

### 2.1 So'rov yo'li (MVC)

Frontend (yoki Postman) so'rov yuborganda u shu zanjir bo'ylab yuradi:

```
Mijoz (Postman / Frontend)
      │   POST http://localhost:3003/order/create
      ▼
 router.ts                  ← "qaysi URL qaysi funksiyaga boradi?" ro'yxati
      │
      ▼
 verifyAuth (middleware)    ← cookie dagi tokenni tekshiradi, req.member ni to'ldiradi
      │   (token yo'q yoki buzuq bo'lsa shu yerda 401 qaytaradi va to'xtaydi)
      ▼
 order.controller.ts        ← so'rovni qabul qiladi, service ni chaqiradi, javob yuboradi
      │
      ▼
 Order.service.ts           ← haqiqiy ish shu yerda (hisob-kitob, bazaga yozish)
      │
      ▼
 Order.model.ts (schema)    ← MongoDB bilan gaplashadi
      │
      ▼
   MongoDB
```

Har qatlamning **yagona vazifasi** bor:

| Qatlam | Vazifasi | Misol |
|--------|----------|-------|
| **router** | URL va funksiyani bog'laydi | `/order/create` → `createOrder` |
| **middleware** | Controllerdan oldin tekshiradi | login qilinganmi? |
| **controller** | So'rovni o'qiydi, javob qaytaradi | `req.body` ni olib, `res.json` qiladi |
| **service** | Biznes mantiq | jami summani hisoblash |
| **schema/model** | Bazadagi hujjat tuzilmasi | `orderTotal` son bo'lishi shart |

`app.ts` da router `app.use("/", router)` bilan ulangan, shuning uchun URL lar `/order/create` ko'rinishida (oldidan boshqa prefiks yo'q). Server porti: `3003`.

### 2.2 Nega 2 ta collection (`orders` va `orderItems`)?

Bitta buyurtmada bir nechta mahsulot bo'lishi mumkin. Masalan, Ali shu buyurtmani berdi:

```
Buyurtma #1:  2 ta Cola (5$)  +  1 ta Pizza (20$)   → jami 30$
```

Buni bitta hujjatga massiv qilib yozish ham mumkin edi. Lekin bu loyihada **ikkiga bo'lingan**:

```
orders (buyurtmaning o'zi)                orderItems (ichidagi har bir qator)
┌──────────────────────────────┐          ┌─────────────────────────────────┐
│ _id: A1                      │◄─────────│ orderId: A1, productId: P1,     │
│ orderTotal: 35               │          │ itemQuantity: 2, itemPrice: 5   │
│ orderDelivery: 5             │          ├─────────────────────────────────┤
│ orderStatus: "PAUSE"         │◄─────────│ orderId: A1, productId: P2,     │
│ memberId: M1                 │          │ itemQuantity: 1, itemPrice: 20  │
└──────────────────────────────┘          └─────────────────────────────────┘
        1 ta buyurtma                              2 ta qator
```

Ularni `orderId` bog'lab turadi. Bu **"bir-ko'pga" (one-to-many)** bog'lanish deyiladi. Buyurtmalarni o'qiyotganda bu ikkisini `$lookup` bilan qayta yig'amiz (5-bo'limda).

---

## 3. Commit 1: `276c921` Schema modellar

**Schema** — bazadagi hujjat (document) qanday ko'rinishda bo'lishi kerakligini aytadigan qolip. Mongoose shu qolipga to'g'ri kelmagan ma'lumotni bazaga yozishga yo'l qo'ymaydi.

### 3.1 `src/schema/Order.model.ts`

```ts
// mongoose kutubxonasini va Schema sinfini olamiz.
// "mongoose" default import: model yaratish uchun. { Schema }: qolip yaratish uchun.
import mongoose, { Schema } from "mongoose";

// OrderStatus enum: buyurtmaning mumkin bo'lgan holatlari ro'yxati
// (PAUSE, PROCESS, FINISH, DELETE). Quyida enum maydonida ishlatamiz.
import { OrderStatus } from "../libs/enums/order.enums";

// Buyurtmaning qolipini (schema) yaratamiz
const orderSchema = new Schema(
  {
    // Jami summa (yetkazib berish bilan birga). Son bo'lishi va albatta berilishi shart.
    orderTotal: { type: Number, required: true },

    // Yetkazib berish narxi (5$ yoki 0$). Son va majburiy.
    orderDelivery: { type: Number, required: true },

    // Buyurtma holati
    orderStatus: {
      type: String,              // matn sifatida saqlanadi: "PAUSE", "PROCESS", ...
      enum: OrderStatus,         // faqat shu 4 qiymatdan biri bo'lishi mumkin
      default: OrderStatus.PAUSE // aytilmasa, avtomatik "PAUSE" (hali to'lanmagan/kutilmoqda)
    },

    // Buyurtmani kim bergan? Member (foydalanuvchi) ning _id si
    memberId: {
      type: Schema.Types.ObjectId, // MongoDB ning maxsus id turi
      required: true,              // egasiz buyurtma bo'lmaydi
      ref: "Member",               // bu id "Member" modeliga tegishli (bog'lanish)
    },
  },
  // 2-argument: sozlamalar
  // timestamps: true  →  mongoose o'zi "createdAt" va "updatedAt" maydonlarini
  //                      qo'shadi va yangilab turadi
  // collection: "orders" → bazada jadval nomi aynan "orders" bo'ladi
  { timestamps: true, collection: "orders" },
);

// "Order" nomli model yasab eksport qilamiz. Service shu model orqali bazaga yozadi/o'qiydi.
export default mongoose.model("Order", orderSchema);
```

**Ehtiyot bo'ling (`1d5e7b8` da tuzatilgan):** dastlab `orderTotal: { typr: Number, ... }` deb yozilgan edi. Mongoose maydon turini faqat `type` kalitidan biladi. `typr` yozilsa, `orderTotal` oddiy son maydoni bo'lmay qoladi va buyurtma yaratib bo'lmaydi.

### 3.2 `src/schema/Orderitem.model.ts`

```ts
import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    // Nechta dona olingan
    itemQuantity: { type: Number, required: true },

    // Bitta donaning narxi (buyurtma paytidagi narx)
    itemPrice: { type: Number, required: true },

    // Qaysi buyurtmaga tegishli (orders dagi _id)
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",      // "Order" modeliga bog'langan
    },

    // Qaysi mahsulot (products dagi _id)
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",    // model nomi aynan "Product" (dastlab "Prduct" deb xato yozilgan edi)
    },
  },
  // Jadval nomi "orderItems": 5-bo'limdagi $lookup ichida shu nomni ishlatamiz
  { timestamps: true, collection: "orderItems" },
);

export default mongoose.model("OrderItem", orderItemSchema);
```

> **Muhim bog'liqlik:** `collection: "orderItems"` deb yozilgani uchun, keyinroq `$lookup` ichida `from: "orderItems"` deb **aynan shu nomni** yozishimiz shart. `Product` modelida `collection` berilmagan, shuning uchun mongoose nomni o'zi `products` qilib qo'yadi (model nomi → kichik harf + ko'plik).

---

## 4. Commit 2: `e47f96b` createOrder API

Maqsad: foydalanuvchi savatdagi mahsulotlarni yuboradi, biz **buyurtma yaratamiz** va har bir mahsulotni `orderItems` ga yozamiz.

### 4.1 Turlar: `src/libs/types/order.ts`

TypeScript'da **interface** ma'lumot qanday ko'rinishda bo'lishini oldindan aytadi. U faqat kod yozish paytida tekshiradi, bazaga ta'sir qilmaydi.

```ts
import { ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enums";
import { Product } from "./product";

// Bazadan o'qilgan bitta buyurtma qatori (orderItems dagi hujjat)
export interface OrderItem {
  _id: ObjectId;
  itemQuantity: number;
  itemPrice: number;
  productId: ObjectId;
  orderId?: ObjectId;     // "?" = bo'lmasligi ham mumkin
  createdAt: Date;        // mongoose timestamps beradigan nom
  updatedAt: Date;
}

// Bazadan o'qilgan buyurtma
export interface Order {
  _id: ObjectId;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  memberId: ObjectId;     // schema dagi nom bilan bir xil bo'lishi kerak
  createdAt: Date;
  updatedAt: Date;
  // Quyidagi 2 tasi bazada saqlanmaydi, getMyOrders dagi $lookup natijasida qo'shiladi
  orderItems: OrderItem[];
  productData: Product[];
}

// Mijozdan keladigan ma'lumot: savatdagi bitta mahsulot
export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: ObjectId;
  orderId?: ObjectId;     // buyurtma yaratilgandan keyin service o'zi to'ldiradi
}
```

### 4.2 Yo'l: `router.ts`

```ts
router.post(
  "/order/create",
  memberController.verifyAuth, // 1-qadam: login qilinganmi? req.member ni to'ldiradi
  orderController.createOrder, // 2-qadam: asosiy ish
);
```

`verifyAuth` shu yerda nega kerak? Buyurtma kimning nomidan yaratilishini bilishimiz kerak. Foydalanuvchi id sini **tokendan** olamiz (`req.member`), mijoz yuborgan ma'lumotdan emas. Chunki mijoz yuborgan ma'lumotga ishonib bo'lmaydi.

### 4.3 Controller: `order.controller.ts`

```ts
// Xatolarni boshqarish uchun: Errors sinfi va HTTP kodlar (200, 400, ...)
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";           // T = oddiy obyekt turi
import { ExtendedRequest } from "../libs/types/member"; // Request + member maydoni
import { Response } from "express";
import OrderService from "../models/Order.service";

// Service dan BITTA nusxa yaratamiz va butun fayl bo'yicha ishlatamiz
const orderService = new OrderService();

// Controller funksiyalarini shu obyektga qo'shib boramiz
const orderController: T = {};

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder");

    // req.member: verifyAuth qo'ygan (tokendan olingan foydalanuvchi)
    // req.body: mijoz yuborgan savat (massiv)
    const result = await orderService.creatOrder(req.member, req.body);

    // Hammasi yaxshi bo'lsa: 200 kod + yaratilgan buyurtmani JSON qilib qaytaramiz
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, createOrder:", err);

    // Biz o'zimiz tashlagan xato bo'lsa (masalan, 400), shu kod bilan qaytaramiz.
    // Kutilmagan xato bo'lsa, umumiy 500 xatosini qaytaramiz.
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};
```

### 4.4 Service: `Order.service.ts` (createOrder qismi)

```ts
class OrderService {
  // "private readonly": faqat shu sinf ichida ishlatiladi va keyin o'zgartirilmaydi
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;

  constructor() {
    this.orderModel = orderModel;               // orders jadvali bilan ishlash uchun
    this.orderItemModel = OrderitemModel;       // orderItems jadvali bilan ishlash uchun
    this.memberService = new MemberService();   // ball berish uchun (6-bo'lim)
  }

  public async creatOrder(
    member: Member,            // buyurtma beruvchi (tokendan)
    input: OrderItemInput[],   // savatdagi mahsulotlar massivi
  ): Promise<Order> {

    // member._id ba'zan matn (string) bo'ladi. MongoDB esa ObjectId turini xohlaydi.
    // Bu yordamchi funksiya (libs/config.ts) agar string bo'lsa ObjectId ga o'giradi.
    const memberId = shapeIntoMongooseObjectId(member._id);

    // JAMI SUMMA: reduce massivni bitta songa "yig'adi"
    //   accumulator = hozirgacha yig'ilgan summa (boshida 0, oxirgi argument)
    //   item        = massivning hozirgi elementi
    // Har bir mahsulot uchun: narx × soni ni qo'shib boramiz.
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);

    // Yetkazib berish: summa 100 dan kam bo'lsa 5$, aks holda bepul
    const delivery = amount < 100 ? 5 : 0;

    try {
      // 1-QADAM: buyurtmaning o'zini orders ga yozamiz
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,  // jami = mahsulotlar + yetkazib berish
        orderDelivery: delivery,
        memberId: memberId,
        // orderStatus ni yozmadik, schema dagi default "PAUSE" avtomatik qo'yiladi
      });

      // Yaratilgan buyurtmaning _id si: endi qatorlarni shunga bog'laymiz
      const orderId = newOrder._id;
      console.log("orderid", orderId);

      // 2-QADAM: har bir mahsulotni orderItems ga yozamiz
      await this.recordOrderitem(orderId, input);

      return newOrder;
    } catch (err) {
      console.log("Error, model:createOrder:", err);
      // Tafsilotni foydalanuvchiga ko'rsatmaymiz, faqat umumiy "Created failed"
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
    }
  }

  // "private": faqat shu sinf ichida chaqiriladi
  private async recordOrderitem(
    orderId: ObjectId,
    input: OrderItemInput[],
  ): Promise<void> {

    // input.map har bir mahsulot uchun BITTA "va'da" (Promise) yaratadi.
    // Hammasi parallel boshlanadi (ketma-ket kutib o'tirmaydi)
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;                                   // qaysi buyurtmaga tegishli
      item.productId = shapeIntoMongooseObjectId(item.productId); // string bo'lsa ObjectId ga
      await this.orderItemModel.create(item);                   // orderItems ga yozamiz
      return "INSERTED";
    });

    // Promise.all: HAMMA va'da bajarilguncha kutadi.
    // Bittasi xato bersa, butun Promise.all xato beradi (yuqoridagi catch ushlaydi).
    const orderItemsState = await Promise.all(promisedList);
    console.log("orderItemsState", orderItemsState); // ["INSERTED", "INSERTED", ...]
  }
}
```

### 4.5 Hisob misoli

Savat: 2 ta Cola (5$) + 1 ta Pizza (20$)

```
amount   = 5×2 + 20×1 = 30
delivery = 30 < 100 ? 5 : 0 = 5
orderTotal = 30 + 5 = 35
```

Agar savat 120$ bo'lsa: `delivery = 0`, `orderTotal = 120`.

---

## 5. Commit 3: `ce59658` getMyOrders API

Maqsad: foydalanuvchi **o'z** buyurtmalarini, holati bo'yicha filtrlab, sahifalab ko'radi. Har buyurtma bilan birga uning mahsulotlari va mahsulot ma'lumotlari ham qaytadi.

### 5.1 Tur

```ts
export interface OrderInquiry {
  page: number;            // nechanchi sahifa
  limit: number;           // bir sahifada nechta buyurtma
  orderStatus: OrderStatus; // qaysi holatdagilar (PAUSE / PROCESS / FINISH)
}
```

### 5.2 Yo'l

```ts
router.get(
  "/order/all",
  memberController.verifyAuth,   // faqat login qilganlar
  orderController.getMyOrders,
);
```

GET so'rovida body bo'lmaydi, ma'lumot URL ichida (query) keladi:
`GET /order/all?page=1&limit=5&orderStatus=PAUSE`

### 5.3 Controller

```ts
orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyOrders");

    // req.query: URL dagi "?" dan keyingi qismlar. Hammasi MATN (string) bo'lib keladi.
    const { page, limit, orderStatus } = req.query;

    const inquiry: OrderInquiry = {
      page: Number(page),                    // "1" (matn) → 1 (son)
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus, // "as": TypeScript ga "ishon, bu OrderStatus" deymiz
    };

    const result = await orderService.getMyOrders(req.member, inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMyOrders:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};
```

### 5.4 Service: aggregate pipeline (eng qiyin joyi)

**Aggregate** = ma'lumotni bir necha bosqichdan o'tkazish. Har bosqich oldingisining natijasini qabul qilib, o'zgartirib, keyingisiga beradi (konveyer kabi).

```ts
public async getMyOrders(member: Member, inquiry: OrderInquiry): Promise<Order[]> {
  const memberId = shapeIntoMongooseObjectId(member._id);

  // Filtr sharti: faqat MENING buyurtmalarim va aynan shu holatdagilari
  const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

  const result = await this.orderModel
    .aggregate([
      // 1) $match: shartga mos hujjatlarni qoldiramiz (SQL dagi WHERE)
      { $match: matches },

      // 2) $sort: tartiblash. -1 = kamayish tartibida, ya'ni YANGILARI TEPADA.
      //    Maydon nomi "updatedAt" (dastlab "updateAt" deb xato yozilgan edi)
      { $sort: { updatedAt: -1 } },

      // 3) $skip: oldingi sahifalarni o'tkazib yuboramiz
      { $skip: (inquiry.page - 1) * inquiry.limit },

      // 4) $limit: faqat shuncha buyurtma olamiz
      { $limit: inquiry.limit },

      // 5) $lookup: boshqa jadvaldan bog'liq hujjatlarni "yopishtiramiz" (SQL dagi JOIN)
      {
        $lookup: {
          from: "orderItems",       // qaysi jadvaldan qidiramiz
          localField: "_id",        // bizning buyurtmaning _id si
          foreignField: "orderId",  // orderItems dagi qaysi maydon shunga teng bo'lishi kerak
          as: "orderItems",         // topilganlarni shu nom bilan massiv qilib qo'shamiz
        },
      },

      // 6) Ikkinchi $lookup: endi mahsulotlarning o'zini ham olamiz
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId", // 5-bosqichda topilgan qatorlardagi productId lar
          foreignField: "_id",
          as: "productData",
        },
      },
    ])
    .exec();

  return result; // topilmasa bo'sh massiv [] qaytadi
}
```

**Sahifalash formulasi** `skip = (page - 1) × limit`:

| page | limit | skip | Qaysi buyurtmalar |
|------|-------|------|-------------------|
| 1 | 5 | 0 | 1–5 |
| 2 | 5 | 5 | 6–10 |
| 3 | 5 | 10 | 11–15 |

**Natija ko'rinishi** (bitta buyurtma):

```json
{
  "_id": "A1",
  "orderTotal": 35,
  "orderDelivery": 5,
  "orderStatus": "PAUSE",
  "memberId": "M1",
  "orderItems": [
    { "productId": "P1", "itemQuantity": 2, "itemPrice": 5 },
    { "productId": "P2", "itemQuantity": 1, "itemPrice": 20 }
  ],
  "productData": [
    { "_id": "P1", "productName": "Cola", "...": "..." },
    { "_id": "P2", "productName": "Pizza", "...": "..." }
  ]
}
```

**Nega `aggregate`da `.lean()` kerak emas?** `aggregate` o'zi oddiy JS obyektlarini qaytaradi.

---

## 6. Commit 4: `0e550d6` updateOrder API va ball berish

Maqsad: buyurtma holatini o'zgartirish (`PAUSE → PROCESS → FINISH`), va buyurtma `PROCESS` ga o'tganda foydalanuvchiga **1 ball** berish.

### 6.1 Tur

```ts
export interface OrderUpdateInput {
  orderId: string;          // qaysi buyurtma
  orderStatus: OrderStatus; // qaysi holatga o'tkazish
}
```

### 6.2 Yo'l

```ts
router.post(
  "/order/update",
  memberController.verifyAuth,  // login shart
  orderController.updateOrder,
);
```

### 6.3 Controller

```ts
orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateOrder");
    const input: OrderUpdateInput = req.body; // { orderId, orderStatus }
    const result = await orderService.updateOrder(req.member, input);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateOrder:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};
```

### 6.4 Service (TO'G'RI variant)

```ts
public async updateOrder(member: Member, input: OrderUpdateInput): Promise<Order> {
  // Bir qatorda 3 ta o'zgaruvchi (vergul bilan ajratilgan)
  const memberId = shapeIntoMongooseObjectId(member._id),
    orderId = shapeIntoMongooseObjectId(input.orderId), // string → ObjectId
    orderStatus = input.orderStatus;

  const result = await this.orderModel
    .findOneAndUpdate(
      // 1-argument: QAYSI hujjatni topish. Ikkala shart ham to'g'ri kelishi kerak:
      //   buyurtma shu foydalanuvchiniki bo'lsin VA id si mos kelsin.
      //   Shu sabab birovning buyurtmasini o'zgartirib bo'lmaydi.
      { memberId: memberId, _id: orderId },

      // 2-argument: NIMANI o'zgartirish
      { orderStatus: orderStatus },

      // 3-argument: new: true → YANGILANGAN holatini qaytar (false bo'lsa eskisini qaytaradi)
      { new: true },
    )
    .exec();

  // Topilmasa result = null bo'ladi. Faqat shunda xato tashlaymiz.
  // 404 ishlatamiz, chunki 304 (NOT_MODIFIED) javobida body bo'lmaydi.
  if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);

  // Status PROCESS bo'lsa, foydalanuvchiga 1 ball beramiz
  if (orderStatus === OrderStatus.PROCESS) {
    await this.memberService.addUserPoint(member, 1);
  }

  return result;
}
```

### 6.5 `Members.service.ts` ga qo'shilgan `addUserPoint`

```ts
public async addUserPoint(member: Member, point: number): Promise<Member> {
  const memberId = shapeIntoMongooseObjectId(member._id);

  return await this.memberModel
    .findOneAndUpdate(
      {
        _id: memberId,
        memberType: MemberType.USER,        // faqat oddiy foydalanuvchiga (restoran/adminga emas)
        memberStatus: MemberStatus.ACTIVE,  // faqat faol foydalanuvchiga (bloklanganga emas)
      },
      // $inc: mavjud qiymatga QO'SHADI. Masalan memberPoints 4 bo'lsa → 5.
      // (oddiy { memberPoints: 1 } yozsak, qiymat 1 ga "almashib" ketardi, qo'shilmasdi)
      { $inc: { memberPoints: point } },
      { new: true },
    )
    .exec();
}
```

---

## 7. Commit 5: `1d5e7b8` xatolarni tuzatish

Bugungi kodlarda topilgan va tuzatilgan xatolar:

| # | Fayl | Xato | Tuzatish | Nega muhim |
|---|------|------|----------|------------|
| 1 | `router.ts` | `orderController.verifyAuth` | `memberController.verifyAuth` | `verifyAuth` orderController da yo'q (`undefined`), server ishga tushishida xato berardi |
| 2 | `Order.model.ts` | `typr: Number` | `type: Number` | `orderTotal` son maydoni sifatida tanilmasdi, buyurtma yaratib bo'lmasdi |
| 3 | `Order.service.ts` | `../schema/order.model` | `../schema/Order.model` | Linux/macOS/serverda fayl topilmaydi (harf katta-kichikligi) |
| 4 | `Order.service.ts` | `ObjectId` import yo'q | `import { ObjectId } from "mongoose"` | TypeScript `Cannot find name 'ObjectId'` deydi |
| 5 | `Order.service.ts` | `$sort: { updateAt: -1 }` | `updatedAt` | Bunday maydon yo'q, tartiblash jim ishlamasdi |
| 6 | `types/order.ts` | `memberIt` | `memberId` | Schema dagi nom bilan mos emas edi |
| 7 | `Orderitem.model.ts` | `ref: "Prduct"` | `ref: "Product"` | Model nomi yozuv xatosi |
| 8 | `Order.service.ts` | `HttpCode.NOT_MODIFIED` | `NOT_FOUND` | 304 javobida body bo'lmaydi, xabar frontendga yetmaydi |

---

## 8. Hali ochiq turgan muammolar

### 8.1 🔴 `updateOrder` hozir doim xato qaytaradi (eng muhimi)

Oxirgi pushda `if (!result)` sharti o'chib ketgan, `throw` esa qolgan:

```ts
// ❌ Hozirgi holat
.exec();

throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED); // shartsiz → HAR DOIM ishlaydi

if (orderStatus === OrderStatus.PROCESS) { ... } // bu qismga hech qachon yetmaydi
return result;
```

**Natija:** buyurtma bazada yangilansa ham API doim `Update failed` qaytaradi, ball ham berilmaydi.

```ts
// ✅ To'g'ri: 6.4 dagi kod. "if (!result)" shartini qaytaring:
if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);
```

### 8.2 🟡 Kichik tuzatishlar

1. `types/order.ts` da hali `createAt` / `updateAt` yozilgan. Mongoose `createdAt` / `updatedAt` beradi, nomni moslang (ishlashni buzmaydi, faqat tur noto'g'ri).
2. `getMyOrders` da `page` yoki `limit` berilmasa `Number(undefined)` = `NaN` bo'lib `$skip` buziladi. Yechim: `Number(page) || 1`, `Number(limit) || 10`.
3. `creatOrder` nomi `createOrder` bo'lishi kerak (ishlaydi, lekin yozuv xatosi).

### 8.3 🔴 Xavfsizlik: narxni mijoz yuboradi

Hozir `itemPrice` frontenddan keladi. Kimdir uni `1` qilib yuborsa, 20$ lik pizzani 1$ ga buyurtma qiladi. **To'g'ri yo'l:** mijozdan faqat `productId` va `itemQuantity` olish, narxni bazadan `Product.productPrice` dan o'qish.

### 8.4 🟡 Ball yig'ish mumkin

Statusni har safar `PROCESS` ga o'zgartirganda `+1` ball beriladi. Bir buyurtmani qayta-qayta yuborib ball yig'ish mumkin. Yechim: faqat status **avval `PROCESS` bo'lmagan** bo'lsa ball berish.

---

## 9. Postman bilan sinash

Tartib muhim: avval login (cookie olish), keyin qolganlari. Postman cookie ni avtomatik saqlaydi.

**1) Login**
```
POST http://localhost:3003/member/login
Body (JSON): { "memberNick": "...", "memberPassword": "..." }
```

**2) Buyurtma yaratish**
```
POST http://localhost:3003/order/create
Body (JSON):
[
  { "itemQuantity": 2, "itemPrice": 5,  "productId": "<mahsulot _id>" },
  { "itemQuantity": 1, "itemPrice": 20, "productId": "<boshqa mahsulot _id>" }
]
```
Kutilgan javob: `orderTotal: 35`, `orderDelivery: 5`, `orderStatus: "PAUSE"`.

**3) Buyurtmalarni ko'rish**
```
GET http://localhost:3003/order/all?page=1&limit=5&orderStatus=PAUSE
```
Kutilgan: ichida `orderItems` va `productData` bor massiv.

**4) Statusni o'zgartirish**
```
POST http://localhost:3003/order/update
Body (JSON): { "orderId": "<2-qadamdagi _id>", "orderStatus": "PROCESS" }
```
Kutilgan: `orderStatus: "PROCESS"` va foydalanuvchining `memberPoints` i 1 taga oshadi. 8.1 tuzatilmaguncha bu `Update failed` qaytaradi.

---

## 10. Lug'at

| Atama | Ma'nosi |
|-------|---------|
| **REST API** | URL + HTTP usuli (GET/POST) orqali ishlaydigan server interfeysi |
| **Schema** | Bazadagi hujjat tuzilmasi qolipi |
| **Model** | Schema asosida yaratilgan, bazaga o'qish/yozish vositasi |
| **Collection** | MongoDB dagi jadval (`orders`, `orderItems`) |
| **Middleware** | Controllerdan oldin ishlaydigan oraliq funksiya (`verifyAuth`) |
| **ObjectId** | MongoDB ning noyob id turi |
| **ref** | Schema maydoni qaysi boshqa modelga bog'langanini ko'rsatadi |
| **timestamps** | `createdAt` va `updatedAt` ni mongoose o'zi yuritadi |
| **enum** | Faqat belgilangan qiymatlardan biri bo'la oladigan tur |
| **aggregate** | Ma'lumotni bosqichma-bosqich qayta ishlash (pipeline) |
| **$lookup** | Boshqa jadvaldan bog'liq hujjatlarni qo'shish (JOIN) |
| **$inc** | Sonni mavjud qiymatga qo'shish |
| **Promise.all** | Bir nechta asinxron ishning hammasini kutish |
| **reduce** | Massivni bitta qiymatga yig'ish |
