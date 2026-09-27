import express from "express";
const routerAdmin = express.Router();
// @ts-ignore - the controller module is resolved at runtime by the project setup.
import restaurantController from "./controllers/restaurant.controller";

routerAdmin.get("/", restaurantController.goHome);
routerAdmin.get("/login", restaurantController.getLogin);
routerAdmin.get("/signup", restaurantController.getSignup);

export default routerAdmin;
