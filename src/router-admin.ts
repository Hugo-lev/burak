import express from "express";
const routerAdmin = express.Router();
import restaurantController from "./controllers/restaurant.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploder";

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

//Products
routerAdmin.get(
  "/product/all",
  restaurantController.verifyRestaurant,
  productController.getAllProducts,
);
routerAdmin.post(
  "/product/create",
  restaurantController.verifyRestaurant,
  makeUploader("product").single("/productImage"),
  productController.createNewProduct,
);

routerAdmin.post(
  "/product/:id",
  restaurantController.verifyRestaurant,
  productController.updateChosenProduct,
);

export default routerAdmin;
