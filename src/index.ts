import { app } from "@azure/functions";
import { GetAllProducts } from "./functions/GetProducts";
import { QueryProduct } from "./functions/QueryProducts";
import { CreateProduct } from "./functions/CreateProduct";
import { DeleteProduct } from "./functions/DeleteProduct";
import { UpdateProduct } from "./functions/UpdateProduct";

app.http('GetAllProducts', {
    methods: ['GET'],
    route: 'allproducts',
    authLevel: 'anonymous',
    handler: GetAllProducts
});

app.http('QueryProduct', {
  methods: ['POST'],
  route: 'products/query',
  authLevel: 'anonymous',
  handler: QueryProduct
});

app.http('CreateProduct', {
  methods: ['POST'],
  route: 'products',
  authLevel: 'anonymous',
  handler: CreateProduct
});

app.http('DeleteProduct', {
  methods: ['DELETE'],
  route: 'products/{id}',
  authLevel: 'anonymous',
  handler: DeleteProduct
});

app.http('UpdateProduct', {
  methods: ['PUT'],
  route: 'products/{id}',
  authLevel: 'anonymous',
  handler: UpdateProduct
});