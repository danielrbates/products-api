import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import productService from "../services/product.services";

export async function QueryProduct(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Extract SQL query from the request body
    const body = await request.json();
    const bodyJson = JSON.stringify(body);
    const userQuery = JSON.parse(bodyJson).query;

    // Filter the response object to only product properties
    let productResponse = await productService.query(userQuery);
    let productJSON = JSON.stringify(productResponse);
    let product = JSON.parse(productJSON).resources[0];

    return {
      status: 200,
      jsonBody: { 
        product
      },
    };
      
  } catch (error: unknown) {
    const err = error as Error;
    context.error(`Error retrieving product: ${err.message}`);

    return {
        status: 500,
        jsonBody: {  
          error: "Failed to retrieve product"
        },
    };
  }
};
