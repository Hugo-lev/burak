# 📘 Burak loyihasi: bugungi (5-noyabr 2026) o'zgarishlar konspekti

> **Repo:** `Hugo-lev/burak` · **Branch:** `devlop` · **Bugungi commitlar:** 5 ta (13:05 dan 17:34 gacha)
> **Bugungi asosiy maqsad:** mahsulotlar uchun 2 ta REST API yozish va "kim qaysi mahsulotni ko'rdi" hisobini (view log) qo'shish.

---

## Mundarija

1. [Bugun nima qilindi? (qisqacha)](#1-bugun-nima-qilindi-qisqacha)
2. [Asos: MVC va so'rov qanday yuradi](#2-asos-mvc-va-sorov-qanday-yuradi)
3. [Bugungi 5 ta commit xabari (commentlar)](#3-bugungi-5-ta-commit-xabari-commentlar)
4. [Kod ichidagi commentlar: qatorma-qator](#4-kod-ichidagi-commentlar-qatorma-qator)
5. [Commit 1: `a2fcd3d` getProducts API](#5-commit-1-a2fcd3d--getproducts-api)
6. [Commit 2: `40bd528` getProduct (skelet)](#6-commit-2-40bd528--getproduct-skelet)
7. [Commit 3: `fd187ef` View tizimi](#7-commit-3-fd187ef--view-tizimi)
8. [Commit 4: `9c31a78` xatolarni tuzatish](#8-commit-4-9c31a78--xatolarni-tuzatish-va-view-mantiqi)
9. [Commit 5: `7f91ca8` tozalash](#9-commit-5-7f91ca8--tozalash-va-routerni-togrilash)
10. [Yakuniy holat va sinab ko'rish](#10-yakuniy-holat-va-sinab-korish)
11. [Diqqat qiladigan joylar](#11-diqqat-qiladigan-joylar)
12. [Lug'at](#12-lugat)

---

## 1. Bugun nima qilindi? (qisqacha)

| # | Nima qo'shildi | Qayerda |
|---|----------------|---------|
| 1 | **Mahsulotlar ro'yxati** API: `GET /product/all` (sahifalash, saralash, filtr, qidiruv) | controller + service + router |
| 2 | **Bitta mahsulot** API: `GET /product/:id` | controller + service + router |
| 3 | **View (ko'rish) tizimi**: login qilgan foydalanuvchi mahsulotni birinchi marta ochsa, bir marta yoziladi va `productViews` 1 ga oshadi | yangi 4 ta fayl |
| 4 | Xatolar tuzatildi (nomlar, sahifalash formulasi, `viewService` yaratilmagani) | Product.service va boshqalar |
| 5 | `Members.service` tozalandi, router to'g'rilandi (`restautrant` → `restaurant`) | Members.service, router |

---

## 2. Asos: MVC va so'rov qanday yuradi

Loyiha **MVC** uslubida yozilgan: har bir fayl bitta ishni qiladi.

```
Brauzer / Postman / React
   │   GET /product/all?page=1&limit=6&order=createdAt
   ▼
┌───────────────────────────┐
│ router.ts                 │ ← "Qaysi URL → qaysi funksiya?" (yo'l ko'rsatuvchi)
└───────────────────────────┘
   ▼
┌───────────────────────────┐
│ controllers/*.controller  │ ← So'rovni QABUL qiladi: req dan ma'lumotni ajratadi,
│                           │   service ni chaqiradi, res.json() bilan JAVOB beradi
└───────────────────────────┘
   ▼
┌───────────────────────────┐
│ models/*.service.ts       │ ← Asosiy MANTIQ: bazaga qanday so'rov berish,
│                           │   qaysi shartlar tekshiriladi
└───────────────────────────┘
   ▼
┌───────────────────────────┐
│ schema/*.model.ts         │ ← MongoDB kolleksiyasining tuzilishi (Mongoose)
└───────────────────────────┘
   ▼
 MongoDB
```

Javob teskari yo'ldan qaytadi: **baza → service → controller → foydalanuvchi**.

> 💡 Bu loyihada `src/models/` papkasida **service** fayllar, `src/schema/` papkasida **Mongoose modellari** turadi. Nomlar chalg'itmasin.

**Yana ikkita muhim tushuncha:**

- **SPA** (Single Page Application): React kabi frontend. Server unga faqat **JSON** beradi.
- **SSR** (Server Side Rendering): serverning o'zi tayyor **HTML sahifa** yasaydi (bu loyihada admin panel).

Kodda `/**SPA */` va `/**SSR */` yozuvlari shuni ajratib turadi.

---

## 3. Bugungi 5 ta commit xabari (commentlar)

Commit xabari = "bu commitda nima qildim" degan qisqa izoh. Bu yerda **Conventional Commits** uslubi ishlatilgan: xabar `tur: tavsif` ko'rinishida.

| Tur | Ma'nosi |
|-----|---------|
| `feat:` | **feature**, yangi imkoniyat qo'shildi |
| `fix:` | **fix**, xato tuzatildi |

| # | Hash | Vaqt | Xabar | Ma'nosi |
|---|------|------|-------|---------|
| 1 | `a2fcd3d` | 13:05 | `feat: develop get Products rest Api` | "Mahsulotlar ro'yxatini beruvchi REST API yozildi" |
| 2 | `40bd528` | 13:47 | `feat: develop get Product rest Api` | "Bitta mahsulotni beruvchi REST API ning boshlanishi" |
| 3 | `fd187ef` | 16:53 | `feat: develop get Product rest Api` | "Bitta mahsulot API davomi + View tizimi qo'shildi" |
| 4 | `9c31a78` | 17:23 | `fix: loyiha get product togrlandi` | "Get product qismidagi xatolar to'g'rilandi" |
| 5 | `7f91ca8` | 17:34 | `fix: boshqa xatolar togrlandi` | "Boshqa xatolar to'g'rilandi" |

> ✍️ **Maslahat:** 2-, 3-commitning xabari bir xil. Keyingi safar farqlash uchun aniqroq yozing, masalan `feat: add view log for getProduct`.

---

## 4. Kod ichidagi commentlar: qatorma-qator

Bugun kodga qo'shilgan (yoki o'chirilgan) **hamma commentlar** shu yerda. Chuqurroq izoh keyingi bo'limlarda.

| # | Fayl | Comment | Nima degani |
|---|------|---------|-------------|
| 1 | `product.controller.ts` | `/**SPA */` | Bo'lim sarlavhasi: pastdagi funksiyalar **frontend (SPA)** uchun JSON qaytaradi |
| 2 | `product.controller.ts` | `/**SSR */` | Bo'lim sarlavhasi: pastdagilar **admin panel (HTML)** uchun |
| 3 | `router.ts` | `/**Products */` | Bo'lim sarlavhasi: pastda mahsulot yo'nalishlari (route) boshlanadi |
| 4 | `Product.service.ts` | `/** SPA */` | Xuddi shu sarlavha (faqat bo'sh joylari to'g'rilangan) |
| 5 | `Members.service.ts` | `// lean documnet returns a plain JavaScript object ...` | `.lean()` nima qilishini tushuntiruvchi izoh (→ [7-bo'lim](#7-commit-3-fd187ef--view-tizimi)) |
| 6 | `Members.service.ts` | `//statusiini ham inobadga oldik` | "Statusni ham hisobga oldik": `DELETE` statusli foydalanuvchi login qila olmaydi |
| 7 | `Members.service.ts` | `// test` (`result.iron = "ayron"; // test`) | Sinov uchun yozilgan qator. **Keyin o'chirildi** |
| 8 | `product.controller.ts` | `// res.status(HttpCode.OK).json(result);` | Vaqtincha **o'chirib qo'yilgan kod**. Keyingi commitda yoqildi |
| 9 | `Product.service.ts` | `//TODO if authenticated users=> first => view log creation` | "Eslatma: agar foydalanuvchi login qilgan bo'lsa, avval view log yaratish kerak". **Keyin amalga oshirildi** |
| 10 | `Product.service.ts` | `// Check View Log Existence` | "View log bor-yo'qligini tekshirish" |
| 11 | `Product.service.ts` | `// Insert New View Log` | "Yangi view log yozish (agar oldin bo'lmasa)" |
| 12 | `Product.service.ts` | `// Insert View` | "Viewni bazaga qo'shish" |
| 13 | `Product.service.ts` | `// Increase Counts` | "Hisoblagichni (`productViews`) oshirish" |
| 14 | `Members.service.ts` | eski `// const tempResult = ...` bloki | Eski kodning izohga olingan nusxasi. **Butunlay o'chirildi** (keraksiz chiqindi) |

> 📌 **Qoida:** `TODO` = "keyin qilaman" degan eslatma. Bajarilgach o'chiriladi. Bu (#9) aynan shunday bo'ldi.

---

## 5. Commit 1: `a2fcd3d` — getProducts API

**Maqsad:** `/product/all` manziliga kelgan so'rovga mahsulotlar ro'yxatini sahifalab qaytarish.

### 5.1. `types/product.ts` — yangi tur `ProductInquiry`

```ts
// "Inquiry" = so'rov/talab.
// Frontenddan keladigan filtr parametrlarini BITTA obyektga yig'ish uchun tur.
export interface ProductInquiry {
  order: string;                          // qaysi maydon bo'yicha saralash: "createdAt", "productPrice", "productViews"...
  page: number;                           // nechanchi sahifa (1 dan boshlanadi)
  limit: number;                          // bir sahifada nechta mahsulot
  productCollection?: ProductCollection;  // IXTIYORIY: faqat shu turdagilar (DISH, DRINK, ...)
  search?: string;                        // IXTIYORIY: nom bo'yicha qidiruv so'zi
}
```

**Qatorma-qator:**

- `export interface` ichidagi barcha maydonlar bu tuzilma **qanday ko'rinishda bo'lishi kerakligini** TypeScript'ga aytadi. Interface faqat tekshiruv uchun; ishga tushganda (JavaScript'ga aylangach) yo'qoladi.
- `export` boshqa fayllar `import { ProductInquiry } from ...` qila olishi uchun.
- `order: string` va `page: number`: **majburiy** maydonlar.
- `productCollection?` va `search?`: `?` belgisi "**ixtiyoriy**, bo'lmasligi ham mumkin" degani. Foydalanuvchi filtr tanlamasa, bu maydonlar umuman bo'lmaydi.

### 5.2. `product.controller.ts` — `getProducts` (yakuniy ko'rinishi, izohlar bilan)

```ts
/**SPA */ // ← bo'lim sarlavhasi: quyidagilar frontend (React) uchun JSON beradi

// async = funksiya ichida "await" ishlatsa bo'ladi (kutib turish mumkin)
// req = kelgan so'rov, res = qaytaradigan javob
productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts"); // terminalda qaysi funksiya ishlaganini ko'rish uchun

    // URL: /product/all?page=1&limit=6&order=createdAt&search=pizza
    // "?" dan keyingi qism = QUERY. Express uni req.query obyektiga solib beradi.
    // Bu yerda 5 ta qiymatni birdaniga ajratib olyapmiz (destructuring).
    const { page, limit, order, productCollection, search } = req.query;

    // MAJBURIY maydonlarni yig'amiz.
    // URL dan hamma narsa MATN (string) bo'lib keladi: "1", "6".
    // Shuning uchun Number(...) bilan songa, String(...) bilan matnga aylantiramiz.
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };

    // IXTIYORIY maydon: faqat kelgan bo'lsa qo'shamiz.
    // "as ProductCollection" = TypeScript'ga "ishon, bu to'g'ri tur" deymiz.
    if (productCollection) {
      inquiry.productCollection = productCollection as ProductCollection;
    }

    // Qidiruv so'zi ham ixtiyoriy.
    if (search) inquiry.search = String(search);

    // Asosiy ishni service ga topshiramiz va natijani KUTAMIZ (await).
    const result = await productService.getProducts(inquiry);

    // 200 OK + natijani JSON ko'rinishida yuboramiz.
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    // Xato bo'lsa: terminalga yozamiz
    console.log("Error, getProducts:", err);
    // Bizning o'zimiz yaratgan Errors bo'lsa, o'sha kod va xabar bilan javob beramiz;
    // kutilmagan xato bo'lsa, standart 500 xatosini beramiz.
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};
```

**Muhim tushunchalar:**

- **`try { ... } catch (err) { ... }`**: `try` ichida xato chiqsa, dastur qulab tushmaydi, `catch` ga o'tadi.
- **`await`** `async` funksiya ichida Promise tugashini kutadi. Bazadan javob kelguncha keyingi qatorga o'tmaydi.
- **`instanceof Errors`**: "bu xato bizning `Errors` klassimizdanmi?" Agar ha, uning `code` (masalan 404) va `message` qismi bor.

> ⚠️ **Bu commitda xato bor edi:** `if (ProductCollection)` deb yozilgan (katta **P** bilan). Bu enum'ning o'zi, u har doim "bor" hisoblanadi. To'g'risi `if (productCollection)` (kichik **p**, foydalanuvchi yuborgan qiymat). **4-commitda tuzatildi.**

### 5.3. `Product.service.ts` — `getProducts` (yakuniy ko'rinishi)

```ts
/** SPA */
// Promise<Product[]> = "kelajakda Product lar MASSIVI qaytaraman"
public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {

  // 1) FILTR: faqat statusi PROCESS (sotuvda) bo'lgan mahsulotlar.
  //    PAUSE (to'xtatilgan) va DELETE (o'chirilgan) larni foydalanuvchiga ko'rsatmaymiz.
  const match: T = { productStatus: ProductStatus.PROCESS };

  // 2) Agar tur tanlangan bo'lsa (masalan DRINK), filtrga qo'shamiz.
  if (inquiry.productCollection)
    match.productCollection = inquiry.productCollection;

  // 3) Agar qidiruv so'zi bo'lsa: nom shu so'zni O'Z ICHIGA OLSIN.
  //    $regex = "shablon bo'yicha qidir"; "i" = katta-kichik harfga farq qo'yma.
  //    Masalan "piz" → "Pizza", "pizza", "PIZZA" hammasi topiladi.
  if (inquiry.search)
    match.productName = { $regex: new RegExp(inquiry.search, "i") };

  // 4) SARALASH: narx bo'yicha bo'lsa 1 (arzondan qimmatga),
  //    boshqa hamma holatda -1 (kattadan kichikka: yangi → eski, ko'p ko'rilgan → kam).
  //    [inquiry.order] = "kvadrat qavs" ichidagi qiymat KALIT nomi bo'ladi.
  //    Masalan order="productPrice" bo'lsa → { productPrice: 1 }
  const sort: T =
    inquiry.order === "productPrice"
      ? { [inquiry.order]: 1 }
      : { [inquiry.order]: -1 };

  // 5) Bazaga so'rov: AGGREGATE = "konveyer lentasi", bosqichma-bosqich ishlov
  const result = await this.productModel
    .aggregate([
      { $match: match },   // 1-bosqich: shartga to'g'ri kelganlarni QOLDIR
      { $sort: sort },     // 2-bosqich: tartibla
      { $skip: (inquiry.page * 1 - 1) * inquiry.limit }, // 3-bosqich: oldingi sahifalarni O'TKAZIB YUBOR
      { $limit: inquiry.limit * 1 },                     // 4-bosqich: faqat shuncha ta ol
    ])
    .exec(); // so'rovni ishga tushir

  // Natija yo'q bo'lsa 404 xatosi (qarang: 11-bo'lim, aggregate bo'sh massiv qaytaradi)
  if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

  return result;
}
```

**Sahifalash (`$skip`) formulasi:** `skip = (page - 1) × limit`

| `page` | `limit` | `skip` | Qaysi mahsulotlar |
|--------|---------|--------|-------------------|
| 1 | 6 | (1−1)×6 = **0** | 1–6 |
| 2 | 6 | (2−1)×6 = **6** | 7–12 |
| 3 | 6 | (3−1)×6 = **12** | 13–18 |

> 💡 `inquiry.page * 1`: `* 1` yordamida qiymat aniq songa aylanadi. `Number(...)` ham xuddi shu ishni qiladi. Ikkalasi ham ishlaydi.

> ⚠️ **Bu commitda 3 ta xato bor edi (4-commitda tuzatildi):**
> 1. `{ ProductStatus: ... }`: katta **P**. Schemada maydon `productStatus` (kichik **p**). Bazada `ProductStatus` degan maydon yo'q, shuning uchun filtr hech narsa topmasdi.
> 2. `match.ProductName`: xuddi shu muammo, to'g'risi `productName`.
> 3. `(page * 1 - 3)`: `-3` xato edi, `-1` bo'lishi kerak. `page=1` da `skip` **manfiy** bo'lib qolardi (`(1−3)×6 = −12`) va MongoDB xato berardi.

### 5.4. `router.ts`

```ts
/**Products */                                   // ← bo'lim sarlavhasi
router.get("/product/all", productController.getProducts);
//     │         │                  └─ shu URL kelganda ishga tushadigan funksiya
//     │         └─ manzil
//     └─ HTTP usul: GET (ma'lumot OLISH uchun)
```

### 5.5. Boshqa mayda o'zgarishlar

- `member.controller.ts`: `"getTopUsers"` → `"getTopUsers "` (oxiriga bo'sh joy). Ahamiyatsiz, faqat konsol yozuvi.
- `Members.service.ts`: `getTopUsers` ichidagi `if (!result) throw ...` o'chirildi (keyingi commitda yana qaytarildi).

---

## 6. Commit 2: `40bd528` — getProduct (skelet)

**Maqsad:** `/product/:id` ga kelganda bitta mahsulotni qaytarish. Bu commitda hali tugallanmagan: javob yuborish qatori izohda turibdi.

### 6.1. Router

```ts
router.get(
  "/product/:id",                // ":id" = o'zgaruvchan qism. /product/65ab12... → id = "65ab12..."
  memberController.retrieveAuth, // 1-qadam (middleware): tokenga qarab foydalanuvchini aniqlaydi
  productController.getProduct,  // 2-qadam: asosiy funksiya
);
```

> ⚠️ **Tartib muhim!** `"/product/all"` **oldin**, `"/product/:id"` **keyin** yozilgan. Express yo'nalishlarni **tepadan pastga** tekshiradi. Agar `:id` birinchi tursa, `/product/all` dagi `all` ham **id** deb o'ylanib qolardi.

### 6.2. `retrieveAuth` va `verifyAuth` farqi (member.controller.ts)

| | `verifyAuth` | `retrieveAuth` |
|---|---|---|
| Token yo'q bo'lsa | **401** xato beradi, to'xtatadi | Xato bermaydi, **davom etadi** (mehmon) |
| Token bor bo'lsa | `req.member` ga foydalanuvchini yozadi | Xuddi shunday yozadi |
| Qachon kerak | Faqat login qilganlar uchun sahifalar | Hamma kirsin, lekin login qilganni **bilib qo'yamiz** |

```ts
memberController.retrieveAuth = async (req, res, next) => {
  try {
    const token = req.cookies["accessToken"];            // cookie dan token olamiz
    if (token) req.member = await authService.checkAuth(token); // bor bo'lsa, kimligini aniqlaymiz
    next();   // ← "keyingi funksiyaga o't". Bo'lmasa so'rov shu yerda qotib qoladi!
  } catch (err) {
    console.log("Error retrieving authenticated user ", err);
    next();   // token buzuq bo'lsa ham to'xtatmaymiz: foydalanuvchi shunchaki mehmon hisoblanadi
  }
};
```

### 6.3. Controller (`getProduct`)

```ts
productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");

    // URL dagi ":id" qismi req.params ichida turadi
    const { id } = req.params;

    // req.member?._id  → "?." (optional chaining):
    //    req.member YO'Q bo'lsa (mehmon), xato bermaydi, shunchaki undefined qaytaradi.
    // ?? null          → (nullish coalescing): chap tomon undefined/null bo'lsa, null ni ol.
    // Natija: login qilgan bo'lsa uning _id si, aks holda null.
    const memberId = req.member?._id ?? null,
      result = await productService.getProduct(memberId, id);

    // res.status(HttpCode.OK).json(result);  ← hozircha izohda, shuning uchun javob KETMAYDI
  } catch (err) { /* ... xuddi oldingidek ... */ }
};
```

> ⚠️ Javob qatori izohda bo'lgani uchun, bu commitda so'rov yuborilsa, brauzer **javob kutib osilib qolardi**. Keyingi commitda yoqildi.

### 6.4. Service (`getProduct`) — hali view yo'q

```ts
public async getProduct(memberId: ObjectId | null, id: string): Promise<Product> {
  // URL dan "id" MATN bo'lib keladi. MongoDB esa ObjectId turini kutadi.
  // shapeIntoMongooseObjectId: matn bo'lsa ObjectId ga aylantiradi, bo'lmasa o'zini qaytaradi.
  const productId = shapeIntoMongooseObjectId(id);

  // let (const emas!) chunki keyinroq result ga yangi qiymat beramiz.
  let result = await this.productModel
    .findOne({ _id: productId, productStatus: ProductStatus.PROCESS }) // faqat sotuvdagisi
    .exec();

  // Topilmasa → 404
  if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

  //TODO if authenticated users=> first => view log creation   ← keyin qilinadigan ish eslatmasi
  return result;
}
```

---

## 7. Commit 3: `fd187ef` — View tizimi

**G'oya:** foydalanuvchi mahsulotni ochganda:
1. Bu foydalanuvchi bu mahsulotni **oldin ko'rganmi?** → bazadan tekshiramiz.
2. Ko'rmagan bo'lsa → "ko'rdi" yozuvini (view log) saqlaymiz va mahsulotning `productViews` sonini **+1** qilamiz.
3. Ko'rgan bo'lsa → hech narsa qilmaymiz (bir kishi 100 marta ochsa ham, **1 ta ko'rish** hisoblanadi).

Buning uchun **4 ta yangi fayl** yaratildi:

### 7.1. `libs/enums/view.enums.ts`

```ts
// Qaysi TURDAGI narsa ko'rilganini bildiradi.
// Hozircha faqat mahsulot. Kelajakda masalan MEMBER, ARTICLE qo'shish mumkin.
export enum ViewGroup {
  PRODUCT = "PRODUCT",
}
```

`enum` = oldindan belgilangan qiymatlar to'plami. Matnni qo'lda yozishda xato (`"PRODCT"`) qilishning oldini oladi.

### 7.2. `libs/types/view.ts`

```ts
// Bazadagi to'liq hujjat ko'rinishi
export interface View {
  _id: ObjectId;        // yozuvning o'z id si (MongoDB beradi)
  viewGroup: ViewGroup; // nima ko'rildi (PRODUCT)
  memberId: ObjectId;   // KIM ko'rdi
  viewRefId: ObjectId;  // NIMANI ko'rdi (mahsulotning id si)
  createdAt: Date;      // qachon yaratildi (avtomatik)
  updatedAt: Date;      // oxirgi o'zgarish (avtomatik)
}

// Yangi yozuv YARATISH uchun kerakli minimal ma'lumot.
// _id, createdAt, updatedAt ni bazaning o'zi qo'yadi, shuning uchun bu yerda yo'q.
export interface ViewInput {
  memberId: ObjectId;
  viewRefId: ObjectId;
  viewGroup: ViewGroup;
}
```

### 7.3. `schema/view.model.ts`

```ts
const viewSchema = new Schema(
  {
    viewGroup: { type: String, enum: ViewGroup, required: true }, // faqat ViewGroup dagi qiymatlar, majburiy
    memberId: {
      type: Schema.Types.ObjectId, // MongoDB id turi
      required: true,
      ref: "Member",               // "Member" modeliga bog'langan (kerak bo'lsa populate qilish mumkin)
    },
    viewRefId: { type: Schema.Types.ObjectId, required: true }, // umumiy havola: ko'rilgan narsaning id si
  },
  { timestamps: true }, // createdAt va updatedAt ni Mongoose O'ZI yuritadi
);

export default mongoose.model("view", viewSchema); // bazada kolleksiya nomi "views" bo'ladi
```

> 💡 `viewRefId`: "**ref**erence" = "havola". Mahsulot, maqola yoki boshqa narsa bo'lishi mumkin, qaysi ekanini `viewGroup` aytadi. Shuning uchun u `ref: "Product"` deb qattiq bog'lanmagan.

> ⚠️ Bu commitda maydon nomi `ViewGroup` (katta V) yozilgan edi, interface esa `viewGroup` (kichik v) deydi. **4-commitda** `viewGroup` ga to'g'rilandi.

### 7.4. `models/view.service.ts`

```ts
class ViewService {
  private readonly viewModel;  // private = faqat shu klass ichida ishlatiladi; readonly = o'zgartirib bo'lmaydi

  constructor() {              // klassdan obyekt yaratilganda BIR MARTA ishlaydi
    this.viewModel = ViewModel;
  }

  // "Bu odam bu narsani oldin ko'rganmi?"
  // findOne → topilsa hujjatni, topilmasa null qaytaradi.
  public async checkViewExistence(input: ViewInput): Promise<View> {
    return await this.viewModel
      .findOne({ memberId: input.memberId, viewRefId: input.viewRefId })
      .exec();
  }

  // "Yangi ko'rish yozuvini saqlash"
  public async insertMemberView(input: ViewInput): Promise<View> {
    try {
      return await this.viewModel.create(input); // bazaga yangi hujjat qo'shadi
    } catch (err) {
      console.log("ERROR, model: insertMemberView:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED); // 400 "Created failed !"
    }
  }
}

export default ViewService;
```

### 7.5. Controller: yakuniy `getProduct`

```ts
productController.getProduct = async (
  // "ExtendedRequest & { params: { id: string } }" = ExtendedRequest + params ichida id MATN ekanligi
  // (TypeScript'ga params.id ning turini aniq aytish uchun)
  req: ExtendedRequest & { params: { id: string } },
  res: Response,
) => {
  try {
    console.log("getProduct");
    const { id } = req.params;
    const memberId: ObjectId | null = req.member?._id ?? null; // tur aniq yozildi
    const result = await productService.getProduct(memberId, id);

    res.status(HttpCode.OK).json(result); // ← izohdan CHIQARILDI, endi javob ketadi
  } catch (err) { /* ... */ }
};
```

### 7.6. `Members.service.ts` ichidagi o'zgarishlar (qatorma-qator)

```ts
// 1) .lean() — izoh bilan
.lean() // lean documnet returns a plain JavaScript object instead of a Mongoose document,
        // which can improve performance and reduce memory usage when you don't need the
        // full functionality of a Mongoose document.
```

**Izohning tarjimasi:** "`lean` hujjat Mongoose hujjati o'rniga **oddiy JavaScript obyekti** qaytaradi. Mongoose hujjatining to'liq imkoniyatlari kerak bo'lmasa, bu tezlikni oshiradi va xotirani tejaydi."
Oddiy qilib aytganda: Mongoose odatda natijaga qo'shimcha usullar (`.save()` va h.k.) yopishtiradi. Bizga faqat ma'lumotni JSON qilib yuborish kerak bo'lsa, `.lean()` bularni olib tashlaydi, shuning uchun tezroq ishlaydi. Izohda `documnet` yozuv xatosi bor (to'g'risi `document`).

```ts
// 2) Sinov qatori (keyin o'chirildi)
result.iron = "ayron"; // test
//  └─ natijaga o'zboshimcha "iron" maydonini qo'shib sinab ko'rilgan. Ishlab chiqarishda kerak emas.

// 3) login ichida
memberStatus: { $ne: MemberStatus.DELETE }, //statusiini ham inobadga oldik
// $ne = "not equal" (teng EMAS). Ya'ni statusi DELETE bo'lmagan foydalanuvchini qidiramiz:
// o'chirilgan akkaunt bilan login qilib bo'lmaydi. Izoh: "statusni ham hisobga oldik".

// 4) Debug qatori (keyin o'chirildi)
console.log("member:", member);
// ⚠️ Bu qator parol heshini ham terminalga chiqarib yuborardi (qarang: 9-bo'lim)

// 5) "!" olib tashlandi
member.memberPassword!  →  member.memberPassword
// "!" = TypeScript'ga "bu null emas, kafolat beraman" degan belgi. Endi u yo'q.

// 6) updateMember
.findByIdAndUpdate({ _id: memberId }, input, { new: true })
→
.findOneAndUpdate({ _id: memberId }, input, { new: true })
// findById... ga oddiy id beriladi. Filtr obyekti ({ _id: ... }) bersak, findOne... to'g'ri vosita.
// { new: true } = "yangilangan HUJJATNI qaytar" (aks holda eski holatini qaytaradi).

// 7) getTopUsers: filtr bir qatordan ko'p qatorga ochildi (faqat o'qilishi oson bo'lsin deb)
.find({
  memberStatus: MemberStatus.ACTIVE,   // faqat faol foydalanuvchilar
  memberPoints: { $gte: 1 },           // $gte = "katta yoki teng": kamida 1 ball
})
.sort({ memberPoints: -1 })            // ko'p balldan kamga qarab
.limit(4)                              // faqat TOP 4 ta
```

Shuningdek, signup ichidagi **izohga olingan eski kod bloki** (`tempResult ...`) o'chirildi, ya'ni kod tozalandi.

---

## 8. Commit 4: `9c31a78` — Xatolarni tuzatish va view mantiqi

Bu commit **ikki ish** qildi: (1) 1-commitdagi xatolarni tuzatdi, (2) `getProduct` ichiga view mantiqini yozdi.

### 8.1. Tuzatilgan xatolar (jadval)

| Xato (oldin) | To'g'ri (keyin) | Sababi |
|--------------|-----------------|--------|
| `if (ProductCollection)` | `if (productCollection)` | Enum emas, foydalanuvchi yuborgan qiymatni tekshirish kerak |
| `{ ProductStatus: ... }` | `{ productStatus: ... }` | Schemadagi maydon nomi kichik harf bilan |
| `match.ProductName` | `match.productName` | Xuddi shu |
| `(page * 1 - 3)` | `(page * 1 - 1)` | `page=1` da skip 0 bo'lishi kerak |
| `inquery` (parametr nomi) | `inquiry` | Yozuv xatosi (inquiry = so'rov) |
| `ViewGroup:` (schemada) | `viewGroup:` | Interface va koddagi nomga moslash |

### 8.2. View mantiqi: `getProduct` ichida (qatorma-qator)

```ts
// memberId bor = foydalanuvchi LOGIN qilgan. Mehmonlar uchun view hisoblanmaydi.
if (memberId) {

  // Check View Log Existence  ← "View log bormi-yo'qmi, tekshiramiz"
  // Tekshirish va yozish uchun kerakli ma'lumotni tayyorlaymiz:
  const input: ViewInput = {
    memberId: memberId,             // kim ko'ryapti
    viewRefId: productId,           // nimani ko'ryapti
    viewGroup: ViewGroup.PRODUCT,   // nima TURI (mahsulot)
  };

  // Bazadan so'raymiz: bu odam bu mahsulotni oldin ko'rganmi?
  // Ko'rgan bo'lsa → hujjat (truthy), ko'rmagan bo'lsa → null (falsy)
  const existView = await this.viewService.checkViewExistence(input);

  // Insert New View Log  ← "YANGI view log yozamiz"
  if (!existView) {            // ← "!" = "agar ko'rmagan bo'lsa"

    // Insert View  ← "Viewni qo'shamiz"
    console.log("PLANNING TO INSERT NEW VIEW");        // debug: bu qadamga yetganini ko'rish uchun
    await this.viewService.insertMemberView(input);    // "views" kolleksiyasiga yangi yozuv

    // Increase Counts  ← "Hisoblagichni oshiramiz"
    const updated = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $inc: { productViews: +1 } },  // $inc = "increment": hozirgi songa +1 qo'sh
        { new: true },                   // yangilangan (productViews oshgan) hujjatni qaytar
      )
      .exec();

    if (updated) result = updated;  // javobda yangi son ko'rinsin deb result ni almashtiramiz
  }
}

return result; // mahsulotni qaytaramiz
```

**Mantiq sxemasi:**

```
getProduct(memberId, id)
   │
   ├─ mahsulot topildimi? ── yo'q ──► 404 xato
   │
   ├─ memberId bormi? ── yo'q (mehmon) ──► mahsulotni shundayligicha qaytar
   │
   └─ ha (login qilgan)
         │
         ├─ oldin ko'rganmi? ── ha ──► mahsulotni shundayligicha qaytar
         │
         └─ yo'q ──► 1) view log yoz
                     2) productViews += 1
                     3) yangilangan mahsulotni qaytar
```

### 8.3. Boshqa o'zgarishlar

- **`order.enums.ts`** (yangi): `OrderStatus` enum'i (`PAUSE`, `PROCESS`, `FINISH`, `DELETE`). **Hozircha hech qayerda ishlatilmagan**, kelajakdagi *Order* (buyurtma) moduli uchun oldindan tayyorlangan.
- **`types/view.ts`**: faqat fayl oxiridagi bo'sh qator yo'qoldi (`No newline at end of file`). Mazmuniga ta'siri yo'q.
- **`Product.service.ts`**: `viewService: any;` qo'shildi, lekin **obyekti yaratilmadi**. Bu xato keyingi commitda tuzatildi (qarang 9-bo'lim).

---

## 9. Commit 5: `7f91ca8` — Tozalash va routerni to'g'rilash

### 9.1. Eng muhim tuzatish: `viewService` yaratildi

**Oldin (4-commit):**
```ts
class ProductService {
  private readonly productModel;
  viewService: any;          // ← faqat "bunday maydon bo'ladi" deb e'lon qilingan, ICHI BO'SH (undefined)

  constructor() {
    this.productModel = ProductModel;
    // viewService ga hech narsa berilmagan!
  }
}
// getProduct ichida this.viewService.checkViewExistence(...) → ❌ TypeError: Cannot read properties of undefined
```

**Keyin (5-commit):**
```ts
import ViewService from "./view.service";   // ← klassni import qildik

class ProductService {
  private readonly productModel;
  public viewService;                       // ← "any" olib tashlandi, turi o'zi aniqlanadi

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();   // ← AYNAN SHU QATOR: klassdan OBYEKT yaratildi
  }
}
```

> 🧠 **Tushuncha:** `viewService: any;` faqat e'lon. **`new ViewService()`** esa haqiqiy obyektni yaratadi. Faqat e'lon qilish yetmaydi, uni **yaratib, o'zlashtirish** kerak.
> `any` esa TypeScript'ning tekshiruvini o'chirib qo'yadi. Shuning uchun xato dastur ishga tushgandagina (runtime) chiqardi, yozish paytida emas. `any` dan qochish kerak.

### 9.2. `Members.service.ts` tozalandi

| O'zgarish | Nima uchun |
|-----------|------------|
| `result.iron = "ayron"; // test` **o'chirildi** | Sinov qatori, kerak emas |
| `console.error("Error, model:signup")` → `console.error("Error, model:signup", err)` | Endi **xatoning o'zi ham** chiqadi. Oldin faqat sarlavha chiqardi, nima xato ekanini bilib bo'lmasdi |
| `console.log("member:", member)` **o'chirildi** | ⚠️ Bu `member` ichida **parol heshi** bor edi (so'rovda `memberPassword: 1` tanlangan). Parolni terminal/log'ga yozish xavfsizlik uchun yomon |
| `   public async getRestaurant` → `  public async getRestaurant` | Chekinish (indent) to'g'rilandi |

### 9.3. `router.ts`

```ts
// OLDIN:
router.get("/member/restautrant", memberController.verifyAuth, memberController.getRestaurant);
//                      ^^^^^^^^^^ yozuv xatosi            ^^^^^^^^^^ login talab qilardi

// KEYIN:
router.get("/member/restaurant", memberController.getRestaurant);
```

Ikki narsa o'zgardi:

1. **Yozuv xatosi tuzatildi:** `restautrant` → `restaurant`.
2. **`verifyAuth` olib tashlandi**, ya'ni endi **login qilmagan odam ham** restoran ma'lumotini ko'ra oladi. Bu to'g'ri, chunki sayt bosh sahifasida restoran haqidagi ma'lumot hammaga ko'rinishi kerak.

`/member/top-users` ham xuddi shunday: `verifyAuth` olib tashlandi, TOP foydalanuvchilar ro'yxati hamma uchun ochiq.

> ⚠️ **Frontend uchun eslatma:** agar frontend hali `/member/restautrant` (xato yozuv) ga murojaat qilayotgan bo'lsa, endi 404 oladi. U ham `restaurant` ga o'zgartirilishi kerak.

---

## 10. Yakuniy holat va sinab ko'rish

### 10.1. Bugungi kundan keyin ishlaydigan manzillar

Router `app.use("/", router)` orqali ulangan, ya'ni manzillarda qo'shimcha prefiks **yo'q**. Standart port: **3003** (`PORT` o'zgaruvchisi berilmasa).

| Usul | Manzil | Login kerakmi? | Vazifasi |
|------|--------|----------------|----------|
| GET | `/member/restaurant` | ❌ yo'q | Restoran ma'lumoti |
| GET | `/member/top-users` | ❌ yo'q | Eng ko'p ball to'plagan 4 foydalanuvchi |
| GET | `/product/all` | ❌ yo'q | Mahsulotlar ro'yxati (sahifalab) |
| GET | `/product/:id` | ⚪ ixtiyoriy | Bitta mahsulot. Login qilgan bo'lsa **view hisoblanadi** |

### 10.2. Postman / brauzer uchun misollar

```
# 1) Eng yangi 6 ta mahsulot (1-sahifa)
GET http://localhost:3003/product/all?page=1&limit=6&order=createdAt

# 2) Faqat ichimliklar, ko'p ko'rilganlari birinchi
GET http://localhost:3003/product/all?page=1&limit=6&order=productViews&productCollection=DRINK

# 3) Narx bo'yicha arzondan qimmatga + "piz" so'zi bilan qidirish
GET http://localhost:3003/product/all?page=1&limit=6&order=productPrice&search=piz

# 4) Bitta mahsulot (id ni bazadan oling)
GET http://localhost:3003/product/65f1c2a9e4b0a1b2c3d4e5f6
```

> 💡 `order` uchun maydon nomlari: `createdAt` (yangilik), `productPrice` (narx), `productViews` (ko'rishlar soni).
> 💡 `productCollection` qiymatlari: `DISH`, `SALAD`, `DESSERT`, `DRINK`, `OTHER`.
> Diqqat: enumda `DESSERT = "DESERT"`, ya'ni bazada saqlanadigan **matn** `DESERT` (bitta S). Filtrda `productCollection=DESERT` yozish kerak bo'ladi.

### 10.3. View tizimini tekshirish (qadamlar)

1. Login qiling (`POST /member/login`). Cookie'da `accessToken` paydo bo'ladi.
2. `GET /product/:id` ni chaqiring → javobdagi `productViews` **1 ga oshadi**.
3. Xuddi shu so'rovni yana yuboring → son **o'zgarmaydi** (oldin ko'rgan).
4. Mehmon sifatida (cookie'siz) chaqiring → son **oshmaydi**.
5. Terminalda `PLANNING TO INSERT NEW VIEW` yozuvi faqat **1-marta** chiqadi.

---

## 11. Diqqat qiladigan joylar

Bular xato emas, lekin keyinroq muammo bo'lishi mumkin bo'lgan joylar.

1. **`page`, `limit`, `order` har doim yuborilishi kerak.**
   Yuborilmasa: `Number(undefined)` → `NaN`; `String(undefined)` → `"undefined"` matni. Natijada MongoDB xato beradi. Yaxshi usul: standart qiymat berish (masalan `page = 1`, `limit = 6`, `order = "createdAt"`).

2. **Noto'g'ri `id` bilan `/product/:id`.** Masalan `/product/abc`: `shapeIntoMongooseObjectId` xato tashlaydi, u `Errors` emas, shuning uchun foydalanuvchi **500** oladi (aslida 400 yoki 404 bo'lishi to'g'riroq).

3. **Qidiruvdagi maxsus belgilar.** `search` to'g'ridan-to'g'ri `new RegExp(...)` ga beriladi. `(` yoki `[` kabi belgi yuborilsa, "noto'g'ri regex" xatosi chiqadi. Keyinchalik belgilarni "qochirish" (escape) kerak bo'ladi.

4. **`if (!result) throw ...` hamma vaqt ham ishlamaydi.** `aggregate` va `find` hech narsa topilmasa `null` emas, **bo'sh massiv `[]`** qaytaradi, u "truthy". Ya'ni bo'sh ro'yxat uchun xato chiqmaydi, `200 []` qaytadi. Bu ko'pincha aynan kerakli xatti-harakat.

5. **Ikki so'rov bir vaqtda kelsa.** Ikkalasi ham "view yo'q" deb o'ylab, ikki marta yozishi mumkin. Bu ancha ilg'or mavzu: kelajakda `memberId + viewRefId` ga **unique index** qo'yish bilan hal qilinadi.

6. **View faqat login qilganlar uchun** hisoblanadi. Mehmonlar hisobga olinmaydi, bu bilgan holda tanlangan yo'l.

---

## 12. Lug'at

| Termin | Oddiy tushuntirish |
|--------|--------------------|
| **REST API** | Server bilan HTTP orqali (GET, POST ...) gaplashish qoidasi: manzil + usul → JSON javob |
| **Route** | "Manzil → funksiya" bog'lanishi |
| **Controller** | So'rovni qabul qilib, javob beruvchi qatlam |
| **Service** | Asosiy mantiq va baza bilan ishlash qatlami |
| **Schema / Model** | MongoDB hujjati qanday maydonlardan iboratligi tavsifi |
| **Middleware** | So'rov controller'ga yetmasidan **oldin** o'tadigan oraliq funksiya (`retrieveAuth` kabi). Oxirida `next()` chaqiradi |
| **`req` / `res`** | `req` = kelgan so'rov, `res` = yuboriladigan javob |
| **`req.query`** | URL dagi `?a=1&b=2` qismi |
| **`req.params`** | URL ichidagi `:id` qismi |
| **`async` / `await`** | Kutish kerak bo'lgan ishlarni (baza) tartibli yozish usuli |
| **Promise** | "Kelajakda natija beraman" degan va'da; `await` shuni kutadi |
| **ObjectId** | MongoDB'ning noyob id turi |
| **Aggregate** | MongoDB'da bosqichma-bosqich (`$match`, `$sort`, ...) ishlov berish "konveyeri" |
| **`$match` / `$sort` / `$skip` / `$limit`** | Filtrla / tartibla / o'tkazib yubor / cheklab ol |
| **`$inc`** | Sonni belgilangan qiymatga oshirish |
| **`$ne` / `$gte`** | Teng emas / katta yoki teng |
| **`.lean()`** | Natijani oddiy JS obyekti sifatida olish (tezroq, yengilroq) |
| **`?.` (optional chaining)** | Obyekt yo'q bo'lsa, xato bermay `undefined` qaytaradi |
| **`??` (nullish coalescing)** | Chap tomon `null`/`undefined` bo'lsa, o'ng tomonni oladi |
| **Enum** | Oldindan belgilangan qiymatlar to'plami |
| **Interface** | Obyekt qanday tuzilishda bo'lishi kerakligini tavsiflovchi TypeScript turi |
| **TODO** | Kodda qoldirilgan "keyin qilinadi" eslatmasi |
| **SPA / SSR** | Frontend ilova (JSON oladi) / Serverda tayyorlangan HTML sahifa |
