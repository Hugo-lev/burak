import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";
import uploader from "./libs/utils/uploder";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";
/** Member **/
router.get(
  "/member/restaurant",

  memberController.getRestaurant,
);
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
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
router.post(
  "/member/update",
  memberController.verifyAuth,
  uploader("members").single("memberImage"),
  memberController.updateMember,
);
router.get(
  "/member/top-users", // ← frontend ActiveUsers shu manzilni chaqiradi (MemberService.getTopUsers)

  memberController.getTopUsers,
);
/** Product **/
router.get(
  "/product/all", // ✅ Barcha mahsulotlarni olish, filtrlash va saralash manzili
  productController.getProducts, // ✅ Mahsulotlar ro'yxatini qaytaruvchi controller (ochiq API)
);
router.get(
  "/product/:id", // ✅ Tanlangan bitta mahsulot ID si bo'yicha olish manzili
  memberController.retrieveAuth, // ✅ Kirgan foydalanuvchini aniqlash middleware (majburiy emas)
  productController.getProduct, // ✅ Mahsulotni topib, ko'rishlar sonini sanab beruvchi controller
);
/** Order **/
router.post(
  "/order/create", // ✅ Yangi buyurtma yaratish manzili
  memberController.verifyAuth, // ✅ Faqat tizimga kirgan foydalanuvchilar kira olishini tekshirish (majburiy)
  orderController.createOrder, // ✅ Buyurtma va uning itemlarini yaratuvchi controller metodi
);
router.get(
  "/order/all", // ✅ Foydalanuvchining o`z buyurtmalarini ko`rish manzili
  memberController.verifyAuth, // ✅ Avtorizatsiyadan o`tganligini tekshirish (majburiy)
  orderController.getMyOrders, // ✅ Buyurtmalar ro`yxatini holati bo`yicha olib beruvchi controller metodi
);
router.post(
  "/order/update", // ✅ Buyurtma holatini o`zgartirish manzili (masalan: PAUSE -> PROCESS)
  memberController.verifyAuth, // ✅ Avtorizatsiyadan o`tganligini tekshirish (majburiy)
  orderController.updateOrder, // ✅ Buyurtma statusini yangilovchi va ball qo`shuvchi controller metodi
);
export default router;
