import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";
import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
  uri: String(process.env.MONGO_URI),
  collection: "sessions",
});

/**1-Enterence**/
const app = express();
console.log("__dirname", __dirname);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(MORGAN_FORMAT)); //logging

/**2-sessions**/
// app.use(
//   session({
//     secret: String(process.env.SESSION_SECRET),
//     cookie: { maxAge: 1000 * 3600 * 3 }, //3 hours
//     store: store,
//     resave: true,
//     saveUninitialized: true,
//   }),
// );
/* ============================================================
 *  SESSION SOZLAMASI
 *  Vazifasi: foydalanuvchi tizimga kirgandan keyin server uni
 *  eslab qolishi uchun (cookie + session).
 *
 *  Muhim: bu kod routerAdmin'dan OLDIN turishi shart!
 *  Aks holda controller'da req.session = undefined bo'ladi.
 * ============================================================ */

app.use(
  // app.use() = "har bir so'rovda shu middleware'ni ishga tushir"
  session({
    /* ------------------------------------------------------
     * 1) SECRET (maxfiy so'z)
     * Cookie ichidagi session ID shu so'z bilan IMZOLANADI.
     * Hujumchi ID'ni soxtalashtirsa, imzo mos kelmaydi va
     * server uni rad etadi.
     *
     * Qiymati .env faylidan olinadi: SESSION_SECRET=uzun_tasodifiy_soz
     * String() = TypeScript uchun (qiymat aniq matn ekanini bildiradi)
     * ------------------------------------------------------ */
    secret: String(process.env.SESSION_SECRET),

    /* ------------------------------------------------------
     * 2) COOKIE sozlamalari
     * maxAge = cookie qancha yashashi (MILLISEKUNDDA).
     *
     *   1000            = 1 sekund
     *   1000 * 3600     = 1 soat
     *   1000 * 3600 * 3 = 3 soat
     *
     * 3 soatdan keyin brauzer cookie'ni o'chiradi va
     * foydalanuvchi qaytadan login qilishi kerak bo'ladi.
     * ------------------------------------------------------ */
    cookie: { maxAge: 1000 * 3600 * 3 }, // 3 soat

    /* ------------------------------------------------------
     * 3) STORE (saqlash joyi)
     * Sessiyalar qayerda saqlanadi? Bizda MongoDB'da
     * ("sessions" collection). Shu sababli nodemon server'ni
     * qayta ishga tushirsa ham login yo'qolmaydi.
     *
     * store o'zgaruvchisi fayl tepasida yaratilgan bo'lishi kerak.
     * ------------------------------------------------------ */
    store: store,

    /* ------------------------------------------------------
     * 4) RESAVE
     * true  = sessiya o'zgarmagan bo'lsa ham har so'rovda qayta yoziladi
     * false = faqat o'zgargandagina yoziladi (tavsiya etiladi)
     * ------------------------------------------------------ */
    resave: true,

    /* ------------------------------------------------------
     * 5) SAVE UNINITIALIZED
     * true  = login qilmagan mehmon uchun ham bo'sh sessiya yaratiladi
     * false = sessiyaga biror narsa yozilgandagina yaratiladi (tavsiya etiladi)
     * ------------------------------------------------------ */
    saveUninitialized: true,
  }),
);
app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance; //views uchun
  next();
});
/**3-views**/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/**4-routers**/
//SSR: EJS
app.use("/admin", routerAdmin);
app.use("/", router); //middleware for routing design patterns

export default app; //module.exports = app;
