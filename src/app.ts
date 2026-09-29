import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";

/**1-Enterence**/
const app = express();
console.log("__dirname", __dirname);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(MORGAN_FORMAT)); //logging

/**2-sessions**/

/**3-views**/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/**4-routers**/
//SSR: EJS
app.use("/admin", routerAdmin);
app.use("/", router); //middleware for routing design patterns

export default app; //module.exports = app;
