import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import productService from "../services/product.services";

export async function GetAllProducts(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    let products = await productService.read();

    return {
      status: 200,
      jsonBody: {
        products
      }
    };
  } catch (error: unknown) {
    const err = error as Error;
    context.error(`Error listing product: ${err.message}`);

    return {
      status: 500,
      jsonBody: {
        error: "Failed to list products",
      },
    };
  }
};