import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import productService from "../services/product.services";

export async function UpdateProduct(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Extract product id from the request
        const id: string = request.params.id;

        // Parse request body to extract partition key and operation data
        const product = await request.json();

        // Update the product using the productService
        const updatedProduct = await productService.update(id, product);

        return {
            status: 200,
            jsonBody: {
                updatedProduct
            }
        };

    } catch (error: unknown) {
        const err = error as Error;
        context.error(`Error updating product: ${err.message}`);

        return {
            status: 500,
            jsonBody: {
                error: "Failed to update product",
            }
        };
    }
};
