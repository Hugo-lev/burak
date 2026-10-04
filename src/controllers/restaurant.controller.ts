import { Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Members.service";
import { LoginInput, MemberInput } from "../libs/types/member";
import { MemberStatus, MemberType } from "../libs/enums/member.enums";

const memberService = new MemberService();

const restaurantController: T = {};
restaurantController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome");
    res.render("home");
  } catch (err) {
    console.log("Error, goHome:", err);
  }
};
restaurantController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("getSignup");
    res.render("signup");
  } catch (err) {
    console.log("Error, getSignup:", err);
  }
};
restaurantController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.render("login");
     // .send | .json | .redirect | .end | .render
  } catch (err) {
    console.log("Error, getLogin:", err);
  }
};
restaurantController.processSignup = async (req: Request, res: Response) => {
  try {
    console.log("processSignup");
    // console.log("body:", req.body);

    const newMember: MemberInput = req.body;
    newMember.memberType = MemberType.RESTAURANT;
    const result = await memberService.processSignup(newMember);

    res.send(result);
  } catch (err) {
    console.log("Error, processSignup:", err);
    res.send(err);
  }
};
restaurantController.processLogin = async (req: Request, res: Response) => {
  try {
    console.log("processLogin");
    console.log("body:", req.body);
    const input: LoginInput = req.body;
    const result = await memberService.processLogin(input);
    res.json(result);
  } catch (err) {
    console.log("Error, processLogin:", err);
    res.json(err);
  }
};

export default restaurantController;
