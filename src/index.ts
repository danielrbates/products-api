import { app } from "@azure/functions";
import { GetProducts } from "./functions/GetProducts";
import { QueryProducts } from "./functions/QueryProducts";
import { CreateProduct } from "./functions/CreateProduct";
import { DeleteProduct } from "./functions/DeleteProduct";
import { UpdateProduct } from "./functions/UpdateProduct";

app.http('GetProducts', {
    methods: ['GET'],
    route: 'products',
    authLevel: 'anonymous',
    handler: GetProducts
});

app.http('QueryProduct', {
  methods: ['POST'],
  route: 'products/query',
  authLevel: 'anonymous',
  handler: QueryProducts
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
  methods: ['PATCH'],
  route: 'products/{id}',
  authLevel: 'anonymous',
  handler: UpdateProduct
});
