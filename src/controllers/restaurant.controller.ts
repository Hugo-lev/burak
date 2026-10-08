import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Members.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberStatus, MemberType } from "../libs/enums/member.enums";
import { Message } from "../libs/Errors";

const memberService = new MemberService();

const restaurantController: T = {};
restaurantController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (err) {
    console.log("Error, goHome:", err);
    res.redirect("/admin");
  }
};
restaurantController.getSignup = (req: Request, res: Response) => {
  //
  try {
    console.log("getSignup");
    res.render("signup");
  } catch (err) {
    console.log("Error, getSignup:", err);
    res.redirect("/admin");
  }
};
restaurantController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.render("login");
    // .send | .json | .redirect | .end | .render
  } catch (err) {
    console.log("Error, getLogin:", err);
    res.redirect("/admin");
  }
};
restaurantController.processSignup = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("processSignup");
    // console.log("body:", req.body);

    const newMember: MemberInput = req.body;
    newMember.memberType = MemberType.RESTAURANT;
    const result = await memberService.processSignup(newMember);
    //Todo: SESSION AUTHENTICATION

    req.session.member = result; //Yangi hozil bolgan restourant
    req.session.save(function () {
      res.send(result);
    });
  } catch (err) {
    console.log("Error, processSignup:", err);
    const messege =
      err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert('${messege}'); window.location.replace('/admin/signup')</script>`,
    );
  }
};

//LOGIN PROCESS
restaurantController.processLogin = async (
  req: AdminRequest, // AdminRequest = oddiy Request + "session ichida member bor"
  res: Response,
) => {
  try {
    console.log("processLogin"); // terminalda: funksiya ishga tushdi
    console.log("body:", req.body); // forma ma'lumoti (diqqat: parol ham chiqadi!)

    /* ---------- 1-BOSQICH: ma'lumotni olish ---------- */

    // Formadan kelgan nick va parol (LoginInput shaklida)
    const input: LoginInput = req.body;

    /* ---------- 2-BOSQICH: parolni tekshirish ---------- */

    // Service nick'ni bazadan topadi, bcrypt bilan parolni solishtiradi.
    // To'g'ri bo'lsa → parolsiz a'zoni qaytaradi.
    // Noto'g'ri bo'lsa → throw qiladi va kod DARROV catch'ga o'tadi
    // (pastdagi session qatorlari umuman ishlamaydi).
    const result = await memberService.processLogin(input);

    /* ---------- 3-BOSQICH: SESSION (asosiy qism) ---------- */

    // Bu qatorga faqat parol TO'G'RI bo'lsa yetib keladi.
    // Sessiyaga a'zoni yozamiz = "bu odam tizimga kirdi".
    // "member" nomini biz o'zimiz tanladik (boshqa nom ham bo'lardi).
    req.session.member = result;

    // save() = sessiyani MongoDB'ga yozadi.
    // Yozib BO'LGANDA ichidagi funksiya (callback) ishga tushadi.
    req.session.save(function () {
      // Javob faqat sessiya saqlangandan keyin yuboriladi.
      res.send(result);
    });
  } catch (err) {
    // Xato bo'lsa (nick yo'q, parol xato) → sessiyaga HECH NARSA yozilmaydi
    console.log("Error, processLogin:", err);
    const messege =
      err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;

    // alert ko'rsatib, login sahifasiga qaytaradi
    res.send(
      `<script>alert('${messege}'); window.location.replace('/admin/login')</script>`,
    );
  }
};

restaurantController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("logout");
    req.session.destroy(function () {
      res.redirect("/admin");
    });
  } catch (err) {
    console.log("Error, logout:", err);
    res.redirect("/admin");
  }
};

restaurantController.checkAuthSession = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("checkAuthSession");
    if (req.session?.member)
      res.send(`<script>alert("${req.session.member.memberNick}")</script>`);
    else res.send(`<script>alert('${Message.Not_Authenticated}')</script>`);
  } catch (err) {
    if (err instanceof Error)
      console.log("Error, checkAuthSession:", err.message);
  }
};

restaurantController.verifyRestaurant = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session?.member?.memberType === MemberType.RESTAURANT){
      req.member = req.session.member;
      next();
    } else {
      const message = Message.Not_Authenticated;
      res.send(
        `<script> alert("${message}"); window.location.replace('/admin/login')</script>`,
      );
    }
  } catch (err) {
    console.log("Error, verifyRestaurant:", err);
  }
};

export default restaurantController;
