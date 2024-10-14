---
languages:
  - typescript
products:
  - azure
description: "Serverless API for Tailwind Traders products manager application"
---

# Products Manager API
This is a simple Azure function for a serverless API that interfaces with a CosmosDB NoSQL database.  I've borrowed heavily from the Microsoft Learn module [Build Serverless APIs with Azure Functions](https://learn.microsoft.com/en-us/training/modules/build-api-azure-functions/).

## Contents
| File/folder       | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `examples`        | Examples of build pipelines and OpenAPI specification files.                  |
| `src`             | The functions and service module that define the API.                         |
| `.funcignore`     | Define what to ignore when publishing the Azure Function.                     |
| `.gitignore`      | Define what to ignore at commit time.                                         |
| `host.json`       | Global configuration options for the function app.                            |
| `README.md`       | This README file.                                                             |
| `LICENSE`         | The license for the sample.                                                   |
| `tsconfig.json`   | Configuration settings for the TypeScript compiler.                           |

## Prerequisites

- Azure tenant
- Azure DevOps organization
- [Node.js](https://nodejs.org/en/)
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools)