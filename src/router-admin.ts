import express from "express";
const routerAdmin = express.Router();
import restaurantController from "./controllers/restaurant.controller";

routerAdmin.get("/", restaurantController.goHome);

routerAdmin
  .get("/login", restaurantController.getLogin)
  //routerga get methodi orqali kelgan sorov login endpointni qonontlantrsa. restaurantController.getLogin methodi ishga tushadi.
  .post("/login/process", restaurantController.processLogin);

routerAdmin
  .get("/signup", restaurantController.getSignup)
  .post("/signup/process", restaurantController.processSignup);

routerAdmin.get("/check-me", restaurantController.checkAuthSession);
routerAdmin.get("/logout", restaurantController.logout);

export default routerAdmin;
