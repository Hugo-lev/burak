# Burak — 2026-11-01 konspekti (JWT + Cookie autentifikatsiya)

> Repo: `Hugo-lev/burak`, branch: `devlop`
> Bugun 4 ta commit qilingan. Hammasi bitta mavzu: **foydalanuvchini token (JWT) va cookie orqali taniydigan tizim** qurish.

---

## 1. Bugungi 4 ta commit

| #   | Vaqt  | Hash      | Nima qildi                                                                                              |
| --- | ----- | --------- | ------------------------------------------------------------------------------------------------------- |
| 1   | 13:57 | `28600d0` | `Auth.service.ts` yaratildi (token yaratish/tekshirish), `cookie-parser` ulandi, `AUTH_TIMER` qo'shildi |
| 2   | 14:24 | `8f89aa9` | login va signup token qaytaradigan bo'ldi, URL lar `/member/...` ga o'zgardi                            |
| 3   | 16:31 | `0fe88c1` | `verifyAuth`, `retrieveAuth` (middleware) va `logout` yozildi                                           |
| 4   | 17:00 | `12b5472` | `getMemberDetail` (service + controller + route) qo'shildi                                              |

Qo'shimcha: `products.js` va `users.js` ga faqat izohlar (comment) yozilgan, mantiq o'zgarmagan.

---

## 2. Noldan: bu nima o'zi?

### Muammo

HTTP **"xotirasiz"**: server har so'rovni yangi so'rov deb biladi. Foydalanuvchi login qilsa ham, keyingi so'rovda server "bu kim edi?" deb so'raydi. Server uni qanday eslab qoladi?

### Ikki yo'l

|                          | Session (oldin admin uchun qilganmiz) | JWT token (bugun)                |
| ------------------------ | ------------------------------------- | -------------------------------- |
| Ma'lumot qayerda         | **Serverda** (MongoDB `sessions`)     | **Tokenning o'zida** (brauzerda) |
| Server nimani tekshiradi | session ID ni bazadan qidiradi        | imzoni (signature) tekshiradi    |
| Ishlatilgan joy          | `/admin` (SSR, EJS)                   | `/member/...` (SPA / REST API)   |

### JWT nima?

`JSON Web Token` — 3 qismdan iborat matn, nuqta bilan ajratilgan:

```
header . payload . signature
```

- **header** — qaysi algoritm ishlatilgani
- **payload** — ichidagi ma'lumot (bizda: butun `Member` obyekti: `_id`, `memberNick` ...)
- **signature** — `SECRET_TOKEN` bilan hosil qilingan **imzo**. Kimdir payload'ni o'zgartirsa, imzo mos kelmaydi va server rad etadi.

> Muhim: payload shifrlanmagan, faqat **imzolangan**. Ichiga parol yozib bo'lmaydi.

### Cookie nima?

Brauzer saqlaydigan kichik ma'lumot. Server `Set-Cookie` bilan yozadi, brauzer **har keyingi so'rovda avtomatik** serverga qaytarib yuboradi. Bizda cookie nomi: `accessToken`.

---

## 3. Umumiy oqim

```
SIGNUP / LOGIN
  brauzer ──POST /member/login──▶ router ─▶ controller.login
                                              │ 1) memberService.login()   → bazadan tekshiradi
                                              │ 2) authService.createToken() → JWT yasaydi
                                              ▼
  brauzer ◀── Set-Cookie: accessToken=<JWT> + JSON { member, accessToken }

KEYINGI HIMOYALANGAN SO'ROV
  brauzer ──GET /member/detail (cookie o'zi ketadi)──▶ router
                      │
                      ├─▶ verifyAuth   → cookie'dan tokenni oladi, imzoni tekshiradi,
                      │                  req.member = token ichidagi ma'lumot, next()
                      │
                      └─▶ getMemberDetail → req.member._id bilan bazadan to'liq ma'lumot oladi
```

Bog'lanish zanjiri (kim kimni chaqiradi):

```
router.ts ─▶ member.controller.ts ─▶ Members.service.ts ─▶ Member.model (MongoDB)
                    │
                    └────────────▶ Auth.service.ts ─▶ jsonwebtoken (jwt)
```

---

## 4. Fayl-fayl tushuntirish

### 4.1 `src/libs/config.ts`

```ts
// Token va cookie necha SOAT yashashi. Bitta joyda saqlaymiz,
// shunda token va cookie muddati doim bir xil bo'ladi.
export const AUTH_TIMER = 24;
```

### 4.2 `src/app.ts`

```ts
import CookieParser from "cookie-parser";

// cookie-parser: brauzerdan kelgan "Cookie" sarlavhasini o'qib,
// req.cookies obyektiga aylantirib beradi.
// Busiz req.cookies["accessToken"] ishlamaydi (undefined bo'ladi).
app.use(CookieParser());
```

### 4.3 `src/models/Auth.service.ts` (yangi fayl)

```ts
import jwt from "jsonwebtoken";

class AuthService {
  // Maxfiy kalit. .env faylidan olinadi (SECRET_TOKEN=uzun_tasodifiy_soz).
  // readonly = keyin o'zgartirib bo'lmaydi.
  private readonly secretToken;

  constructor() {
    this.secretToken = process.env.SECRET_TOKEN as string;
  }

  // TOKEN YASASH
  // jwt.sign "callback" usulida ishlaydi (natija keyinroq keladi).
  // Uni async/await bilan ishlatish uchun Promise ichiga o'raymiz.
  public async createToken(payload: Member) {
    return new Promise((resolve, reject) => {
      const duration = `${AUTH_TIMER}h`; // masalan "24h"

      jwt.sign(
        payload, // 1) token ichiga nima yoziladi
        process.env.SECRET_TOKEN as string, // 2) imzolash uchun maxfiy kalit
        { expiresIn: duration }, // 3) token 24 soatdan keyin yaroqsiz bo'ladi
        (err, token) => {
          // 4) tayyor bo'lganda shu funksiya chaqiriladi
          if (err)
            reject(
              new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED),
            );
          else resolve(token as string); // tayyor token matni
        },
      );
    });
  }

  // TOKEN TEKSHIRISH
  // To'g'ri bo'lsa payload (Member) qaytaradi,
  // noto'g'ri yoki muddati o'tgan bo'lsa XATO TASHLAYDI.
  public async checkAuth(token: string): Promise<Member> {
    const result: Member = (await jwt.verify(
      token,
      this.secretToken,
    )) as Member;
    console.log(`---[Auth] memberNick:${result.memberNick} ---`);
    return result;
  }
}
```

### 4.4 `src/controllers/member.controller.ts`

**signup / login** — token yasab, cookie ga yozadi:

```ts
// 1) Foydalanuvchini bazadan tekshir/yarat
const result = await memberService.signup(input);

// 2) Token yasa (Promise qaytaradi, shuning uchun await kerak!)
const token = await authService.createToken(result);

// 3) Tokenni brauzer cookie'siga yoz
res.cookie("accessToken", token, {
  maxAge: AUTH_TIMER * 3600 * 1000, // soat → millisekund (24 * 3600 * 1000)
  httpOnly: false, // false = frontend JS cookie'ni o'qiy oladi
});

// 4) Javob: status + member + token (frontend tokenni JSON dan ham olishi mumkin)
res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
```

**logout:**

```ts
// Cookie'ni o'chirish: maxAge: 0 = "darhol eskirsin"
res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
res.status(HttpCode.OK).json({ logout: true });
```

**verifyAuth** — "qo'riqchi" (middleware). Himoyalangan yo'llar oldida turadi:

```ts
const token = req.cookies["accessToken"]; // cookie-parser sabab ishlaydi
if (token) req.member = await authService.checkAuth(token); // tokendan Member'ni tikla

// Token yo'q bo'lsa — kirish taqiqlanadi (401)
if (!req.member) throw new Errors(HttpCode.UNAUTHORIZED, Message.UNAUTHORIZED);

next(); // hammasi joyida → keyingi funksiyaga (controller'ga) o'tkaz
```

**retrieveAuth** — verifyAuth ning "yumshoq" varianti: token bo'lsa `req.member` ni to'ldiradi, **bo'lmasa ham xato bermaydi**, `next()` qiladi. Mehmon ham, login qilgan ham kiradigan sahifalar uchun (hozircha hech qayerda ishlatilmagan).

**getMemberDetail:**

```ts
// req.member — verifyAuth to'ldirib bergan (token ichidagi ma'lumot)
const result = await memberService.getMemberDetail(req.member);
res.status(HttpCode.OK).json(result);
```

### 4.5 `src/models/Members.service.ts` → `getMemberDetail`

```ts
public async getMemberDetail(member: Member): Promise<Member> {
  // String ko'rinishidagi id ni MongoDB ObjectId ga aylantiradi
  const memberId = shapeIntoMongooseObjectId(member._id);

  // Faqat ACTIVE holatdagi a'zoni qidiradi.
  // Token 24 soat yaroqli, lekin admin shu orada foydalanuvchini BLOCK qilgan bo'lishi mumkin —
  // shu sababli tokenga emas, bazadagi HOZIRGI holatga ishonamiz.
  const result = await this.memberModel
    .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
    .exec();

  if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
  return result;
}
```

> `memberPassword` sxemada `select: false` — shuning uchun parol hash'i javobga chiqib ketmaydi. Yaxshi.

### 4.6 `src/router.ts`

```ts
router.post("/member/login", memberController.login); // ochiq
router.post("/member/signup", memberController.signup); // ochiq

// Bir nechta funksiya ketma-ket: avval verifyAuth, u next() desa — logout
router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout,
);
router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail,
);
```

URL lar `/login/process` va `/signup` dan `/member/...` ga ko'chdi. Frontend (`src/public/js`, `views`) da eski URL ishlatilmagan — bu yerda muammo yo'q.

### 4.7 `src/libs/types/member.ts` va `Errors.ts`

```ts
export interface Member { _id: ObjectId; ... }   // _id qo'shildi (tokenda va service'da kerak)

// Request ga "member" maydonini qo'shamiz, shunda req.member TypeScript'da xato bermaydi
export interface ExtendedRequest extends Request {
  member: Member;
  file: Express.Multer.File;
  files: Express.Multer.File[];
}
```

---

## 5. ⚠️ Topilgan xatolar

### 🔴 1) `login` da `await` yo'q (haqiqiy xato)

`member.controller.ts`, login funksiyasi:

```ts
token = authService.createToken(result); // ❌ await yo'q
```

`createToken` — `Promise` qaytaradi. `await`siz `token` tokenning o'zi emas, **va'da (Promise)** bo'lib qoladi. Natija: cookie ichiga `[object Promise]` yoziladi, JSON da `accessToken: {}` ketadi. Keyingi `verifyAuth` esa tokenni o'qiy olmaydi.

```ts
token = await authService.createToken(result); // ✅
```

(`signup` da `await` bor — faqat `login` da tushib qolgan.)

### 🔴 2) `HttpCode.CREATED` = 305, 201 emas

`Errors.ts`:

```ts
NOT_MODIFIED = 304,
CREATED,           // ❌ qiymat berilmagan
```

TypeScript enum qiymat berilmasa **oldingisiga +1** qo'yadi → `CREATED = 305`. 305 — "Use Proxy" degan eski kod. Signup shu status bilan javob qaytaradi, `axios` esa 200–299 dan tashqari hamma statusni **xato** deb hisoblaydi → frontend signup muvaffaqiyatli bo'lsa ham `.catch` ga tushadi.

```ts
CREATED = 201,     // ✅
```

### 🟠 3) `verifyAuth`: noto'g'ri/eskirgan token → 500, 401 bo'lishi kerak

`jwt.verify` xato tashlaydi (`JsonWebTokenError` / `TokenExpiredError`). Bu `Errors` klassi emas, shuning uchun `catch` da `Errors.standard` (500) qaytadi. Aslida foydalanuvchi shunchaki "tizimga kirmagan" — 401 bo'lishi kerak.

### 🟡 4) `logout`: `res.clearCookie` toza usul

`res.cookie("accessToken", null, { maxAge: 0 })` ishlaydi, lekin `res.clearCookie("accessToken")` o'qishga oson va to'g'ri. Yana: login da `httpOnly: false`, logout da `httpOnly: true` — ikkalasi bir xil bo'lgani yaxshi.

### 🟡 5) Xavfsizlik eslatmasi: `httpOnly: false`

Bunda JavaScript cookie'ni o'qiy oladi. Agar saytda XSS zaifligi bo'lsa, tokenni o'g'irlash mumkin. O'quv loyihasida frontend o'qishi uchun shunday qilinadi, lekin real loyihada `httpOnly: true` tavsiya etiladi.

### 🟡 6) Mayda narsalar

- `Message.TOKEN_CREATION_FAILED = "tpken creation is error"` → imlo xatosi ("token creation failed !").
- `.env` ga `SECRET_TOKEN` qo'shilganini tekshiring. Yo'q bo'lsa `jwt.sign` xato beradi (`TOKEN_CREATION_FAILED`, 401 chiqadi).
- Controller ichida eskirgan `// TODOS: TOKENS Authentication` izohlari qolgan — endi o'chirsa bo'ladi.
- `jsonwebtoken ^8.5.1`, lekin `@types/jsonwebtoken ^9.0.5` — versiyalar mos emas (odatda ishlaydi, lekin bir xil qilgan yaxshi).
- `products.js` oxirida `}  ` (ortiqcha bo'shliq). Izoh o'zgarishlarini alohida commit (`docs:` yoki `chore:`) qilgan toza bo'ladi — 1-commit ga aralashib ketgan.
- `retrieveAuth` yozilgan, lekin hali hech qayerda ishlatilmagan (xato emas, keyingi qadam uchun).
- Commit xabarlaridagi imlo: `authentcation`, `getMemberDeatil`, `bussines`.

---

## 6. Tuzatilgan kod (nusxa ko'chirish uchun)

```ts
// ---------- Errors.ts ----------
export enum HttpCode {
  OK = 200,
  CREATED = 201, // ✅ aniq qiymat
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
// Message ichida:
// TOKEN_CREATION_FAILED = "Token creation failed !",

// ---------- member.controller.ts ----------
memberController.login = async (req: Request, res: Response) => {
  try {
    const input: LoginInput = req.body;
    const result = await memberService.login(input);
    const token = await authService.createToken(result); // ✅ await qo'shildi

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });
    res.status(HttpCode.OK).json({ member: result, accessToken: token });
  } catch (err) {
    console.log("Error Login ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    res.clearCookie("accessToken"); // ✅ cookie'ni to'g'ri o'chirish
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    console.log("Error, logout:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies["accessToken"];
    if (!token)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    try {
      // token buzilgan yoki muddati o'tgan bo'lsa jwt xato tashlaydi
      req.member = await authService.checkAuth(token);
    } catch {
      // ✅ uni 500 emas, 401 ga aylantiramiz
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
    }

    next();
  } catch (err) {
    console.log("Error verifying token ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};
```

---

## 7. Bugun nimani o'rgandim (qisqa xulosa)

1. **JWT** — ma'lumot tokenning o'zida, serverda saqlanmaydi; imzo bilan himoyalangan.
2. **Cookie** — brauzer tokenni har so'rovda avtomatik yuboradi; `cookie-parser` uni `req.cookies` ga aylantiradi.
3. **Middleware** (`verifyAuth`) — controller'dan oldin turadigan qo'riqchi; `next()` desa o'tkazadi.
4. **Promise qaytaradigan funksiya** albatta `await` bilan chaqiriladi.
5. **TypeScript enum** — qiymat berilmasa oldingisiga +1 bo'ladi.
