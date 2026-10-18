import ProductModel from "../schema/Product.model";
import {
  Product,
  ProductInput,
  ProductUpdateInput,
} from "../libs/types/product";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";

class ProductService {
  // Mahsulotlar bazasi (schema) shu yerda saqlanadi
  private readonly productModel;

  constructor() {
    this.productModel = ProductModel;
  }

  /** SSR */
  // Barcha mahsulotlarni bazadan olib keladi
  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  // Yangi mahsulot yaratadi
  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.error("Error, model: createNewProduct", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  // Mavjud mahsulotni yangilaydi
  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput,
  ): Promise<Product> {
    // matn (string) ko'rinishidagi id ni MongoDB ObjectId ga aylantiramiz
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default ProductService;
