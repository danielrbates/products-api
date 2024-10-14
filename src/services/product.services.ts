import { CosmosClient } from "@azure/cosmos";

// Set connection string from CONNECTION_STRING value in local.settings.json
const CONNECTION_STRING = process.env.DOCDBCONNSTR_CosmosDbConnectionString;

// Define our database
const databaseId = "SampleDB";
const containerId = "SampleContainer";

const productService = {
  init() {
    try {
      this.client = new CosmosClient(CONNECTION_STRING);
      this.database = this.client.database(databaseId);
      this.container = this.database.container(containerId);
    } catch (err) {
      console.log(err.message);
    }
  },

  async create(productToCreate) {
    const { resource } = await this.container.items.create(productToCreate);
    return resource;
  },

  async read(): Promise<string> {
    const iterator = this.container.items.readAll();
    const { resources } = await iterator.fetchAll();
    return resources;
  },

  async query(itemId: string) {
    try {
      const querySpec = {
        query: `SELECT * FROM ${containerId} as c WHERE c.id = @id`,
        parameters: [{
          name: "@id",
          value: itemId
        }]
      };
      const queryResults = await this.container.items.query(querySpec).fetchAll();
      return queryResults;
    } catch (error) {
      console.error(`An error occurred in the query: ${error.message}`);
    }
  },

  async update(product) {
    const { resource } = await this.container.item(
      product.id,
      product.brand.name,
    )
      .replace(product);
    return resource;
  },
  async delete(id: string) {
    const result = await this.container.item(id).delete();
    return;
  },
};

productService.init();

export default productService;