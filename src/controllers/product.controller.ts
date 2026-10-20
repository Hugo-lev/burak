import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Request, Response } from "express";
import { ProductInput } from "../libs/types/product";
import { AdminRequest } from "../libs/types/member";
import ProductService from "../models/Product.service";

// new → klassdan OBYEKT yaratadi. getAllProducts kabi usullar faqat shu obyektda ishlaydi.
const productService = new ProductService();

const productController: T = {};

productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");
    const data = await productService.getAllProducts(); // kichik "p": obyekt
    res.render("products", { products: data });
  } catch (err) {
    console.log("Error, getAllProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("createNewProduct");
    console.log("req:body", req.body);
    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATED_FAILED);

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });

    await productService.createNewProduct(data);
    res.send(
      `<script>alert("Successfully created!"); window.location.replace('/admin/product/all')</script>`,
    );
  } catch (err) {
    console.log("Error, createNewProduct:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    // JSON.stringify → xabar ichida ' yoki " bo'lsa ham skript buzilmaydi
    res.send(
      `<script>alert(${JSON.stringify(message)}); window.location.replace('/admin/product/all')</script>`,
    );
  }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    const id = req.params.id;
    const result = await productService.updateChosenProduct(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;
