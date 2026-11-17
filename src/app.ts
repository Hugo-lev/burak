import cors from "cors";
import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";
//
import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});
/** 1-ENTRANCE **/
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("./uploads")); // yuklangan rasmlar shu yerdan beriladi (frontend: serverApi + "/uploads/...")
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ YANGI — CORS sozlamasi (routerlardan OLDIN turishi shart!)
app.use(
  cors({
    credentials: true, // cookie (JWT token) yuborishga va qabul qilishga ruxsat
    origin: true, // so'rov qaysi origin'dan kelsa, shuni qaytarib ruxsat beradi (hamma uchun ochiq)
  }),
);

app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT));

/** 2-SESSIONS **/
app.use(
  session({
    secret: String(process.env.SESSION_SECRET),
    cookie: {
      maxAge: 1000 * 3600 * 6, // 6 hours
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  }),
);
//midleware
app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member;
  next();
});
/** 3-VIEWS **/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4-ROUTERS **/
app.use("/admin", routerAdmin); //ssr
app.use("/", router); // React

export default app;

// EJS
// REACT
