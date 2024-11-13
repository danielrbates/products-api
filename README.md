---
languages:
  - typescript
products:
  - azure
description: "Serverless API for Tailwind Traders products manager application"
---

<div align="center">
  <a href="https://github.com/danielrbates/products-api/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/danielrbates/products-api"></a>
  <a href="https://github.com/danielrbates/products-api/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/danielrbates/products-api"></a>
  <a href="https://github.com/search?q=repo%3Adanielrbates%2Fproducts-api++language%3ATypeScript&type=code"><img alt="Language" src="https://img.shields.io/github/languages/top/danielrbates/products-api"></a>
</div>

# Products Manager API
This is a simple Azure Function App for a serverless API that interfaces with a CosmosDB NoSQL database.  I've borrowed heavily from the Microsoft Learn module [Build Serverless APIs with Azure Functions](https://learn.microsoft.com/en-us/training/modules/build-api-azure-functions/).

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

## Installation

#### Table of contents:
- [Prerequisites](#prerequisites)
- [Set up Azure DevOps](#set-up-azure-devops)
- [Create Azure resources](#create-azure-resources)
- [CI/CD with Azure Pipelines](#ci-cd-with-azure-pipelines)
- [Code review](#code-review)
- [All about APIs](#all-about-apis)
- [Now we can do fun stuff](#now-we-can-do-fun-stuff)
- [Troubleshooting](#troubleshooting)

### Prerequisites

- Azure tenant
- Azure DevOps organization
- (Optional) IDE such as Visual Studio Code

### Set up Azure DevOps

#### Create an Azure DevOps organization

Skip this step if you already have an Azure DevOps organization linked to your Azure tenant.

Navigate to [https://dev.azure.com](https://dev.azure.com/) and create an organization.

#### Configure Azure DevOps

We need to request increased parallelism for our pipelines.  Go to [https://aka.ms/azpipelines-parallelism-request/](https://aka.ms/azpipelines-parallelism-request/) and submit the form with your name, email address, Azure DevOps organization name, and public/private setting (we're using a Private project in this lab).

![image](https://github.com/user-attachments/assets/482e064d-9230-46a4-a94b-ac352d2df1d9)

The form notes that it may take 2-3 days to process.  There is an alternative process documented in [Defender for Cloud Labs, Module 14 Appendix 1](https://github.com/Azure/Microsoft-Defender-for-Cloud/blob/e885fc70279139716ed1d1b26d32c6a004c4b3e9/Labs/Modules/Module14-Appendix1.pdf) that uses a hosted build agent for Azure Pipelines.

Next, enable GitHub Advanced Security in your Azure DevOps organization.  From **Organization Settings**, find **Repositories** and toggle Advanced Security to **On**:

![image](https://github.com/user-attachments/assets/e1a6c7e1-46ab-4b27-8db7-f060cda8130d)

You may need to enable billing to your Azure subscription.  If so, follow the configuration settings in the sidebar to select your Azure subscription and enable billing by active committers at the Basic level.

#### Create an Azure DevOps project

Create a new project with the default settings (private visibility, Git version control, and Basic work item process).

![image](https://github.com/user-attachments/assets/c122f810-9da9-479c-a3a7-31abacc38b97)

#### Import source code from GitHub

Click on **Repos** to initiate a new repository.  The third option, **Import a repository**, will allow us to clone all the necessary source code.  Paste the URL of this GitHub repo into the Clone URL field and click Import:

> https://github.com/danielrbates/products-api.git

![image](https://github.com/user-attachments/assets/7fcb126a-6834-4c3e-9932-469f27c8add6)

It may take a few moments, but you should soon have the source code in your Azure DevOps repository.  

![image](https://github.com/user-attachments/assets/906d91bf-ccfe-4bbc-8f5a-abbe2e91eebb)

#### Onboard Azure DevOps to Microsoft Defender for Cloud

From Defender for Cloud, open **Environment Settings** and add **Azure DevOps** as a new environment.

![image](https://github.com/user-attachments/assets/65482033-c75b-4f2c-be0d-493149db62dd)

Authorize the connection and accept the Microsoft Security DevOps App permissions request.

![image](https://github.com/user-attachments/assets/8478b5ac-52c4-4cd7-b8eb-56aa015bb2c9)

Lastly, install the [Advanced Security Build Tasks](https://marketplace.visualstudio.com/items?itemName=ms.advancedsecurity-tasks&targetId=58c6d9da-d295-4fe4-a535-0c951806d6f6&utm_source=vstsproduct&utm_medium=ExtHubManageList) extension from the Marketplace.


### Create Azure resources

#### Overview

Our goal for this step is to create the basic Azure resources we'll need for this project.  We will start with creating a resource group that will house all the services for this project.  Next, we'll create a Cosmos DB account and populate it with a database, container, and sample items.  Then, we will create an empty Function App that we will later build from an Azure DevOps pipeline.

#### Create resource group

First, create a resource group for our project.  I've named this **rg-products-manager** and am working in **East US 2**:

![image](https://github.com/user-attachments/assets/cc876fc8-922e-4730-a7c4-1dda94d58e15)

#### Create Cosmos DB account

We need a database to store items for our API to query and return.  In this project, we'll use a fully managed, serverless NoSQL Cosmos DB.  Create a new Cosmos DB account with the following settings.

* **Resource group**: as configured above
* **Account name**: choose a unique account name for your Cosmos DB service
* **Location**: align with the resource group location - in this case, I've chosen **East US 2**
* **Capacity mode**: serverless

![image](https://github.com/user-attachments/assets/67ddb45f-da27-4fd9-9851-479c31d7646c)

Leave all other settings at their defaults.  Review and create the database account.

#### Configure Cosmos DB

We need to configure some settings in our Cosmos DB account before moving on.  First, go to **Settings** > **Microsoft Defender for Cloud** and ensure that the database account is protected by Defender for Azure Cosmos DB.  If not, enable this plan from Microsoft Defender for Cloud environment settings.

![image](https://github.com/user-attachments/assets/4de38e52-85a7-4303-889b-84b25f938954)

Next, we will enable detailed logging of data plane activities.  Go to **Monitoring** > **Diagnostic settings** and click **+ Add diagnostic setting**:

![image](https://github.com/user-attachments/assets/7a140a13-26dd-4a16-b028-2cda8ee778c3)

Provide a name for the diagnostic setting and configure the following options:

* **Categories**: select **QueryRuntimeStatistics** (you can select other categories, or use the **allLogs** category groups, but ensure that **QueryRuntimeStatistics** is checked)
* **Log Analytics workspace**: choose whichever workspace you prefer to use for queries
* **Destination table**: ensure **Resource specific** is selected

![image](https://github.com/user-attachments/assets/8a062c39-f157-4f01-afdf-5b48e27f804c)

Next, we will enable full query text for our diagnostic logs.  From Settings, choose **Features** and enable **Diagnostics full-text query**.  It may take a few moments for this setting to unlock; if you see a status of "Pending", wait a minute or two and refresh.

![image](https://github.com/user-attachments/assets/e69ce0f7-86ce-4075-9a0d-557978d3d6c6)

Next, we will configure Cross-Origin Resource Sharing (CORS) to restrict requests to only those coming from our function app's domain.  You can find this domain from the overview of the Function App we created earlier; check the **Default domain** field as highlighted here:

![image](https://github.com/user-attachments/assets/c392e74f-557f-4185-8b42-47bf30da12ff)

Copy this value into the **Allowed Origins** field of the **CORS** setting in your Cosmos DB account (don't forget to prepend the 'https://' scheme).

![image](https://github.com/user-attachments/assets/a7a708d6-8f7a-409a-9a77-7013c60e9d14)

##### Create a database and container

Our Cosmos DB account needs some data.  We can use the Quick Start tutorial to get a data set deployed without any trouble.  From **Data Explorer**, click **Launch quick start** and go through the steps to create a database, a container, and a data set.

![image](https://github.com/user-attachments/assets/fee19ec3-299e-4158-9ff3-85a0ba712832)

The tutorial will create the following for us - just click **Next** four times.

* **Database id:** SampleDB
*  **Container id:** SampleContainer
* **Partition key:** /categoryId

These values are important as we will need to reference them in our function app code.  Make a note if the database ID or container ID are different than the values above.

If you click **Items** in Data Explorer, you will see a long list of product records returned by the query `SELECT * FROM c`.  Each record has a randomly-generated alphanumeric ID, a name, description, price, category name and ID, and other properties.

![image](https://github.com/user-attachments/assets/810b8173-1a74-40b1-ac5e-3d4dcffd3b7d)

Finally, go to **Settings** > **Keys** and make a note of the primary connection string.  We will reference this secret as an environment variable in our Function App.

#### Create Function App

We will create an empty Function App that we'll later use as the target for our automated CI/CD pipeline.  This project only needs the basic Consumption tier, but you can choose Flex or Premium if you want to use more advanced identity and private network configurations or App Service if you'd like to test Defender for App Service workload protections.

![image](https://github.com/user-attachments/assets/7a90ff54-ff3d-4906-91c3-f41935641aee)

Use the following settings:

* **Resource group:** as configured above
* **Function App name:** select a globally unique name for your function app.  The Cloud Adoption Framework recommends a set of standard prefixes for Azure resource types.
* **Runtime stack:** Node.js
* **Version:** 20 LTS
* **Region:** align with your Resource Group's region (I've chosen East US 2)
* **Operating System:** Linux

![image](https://github.com/user-attachments/assets/b865c6f8-de21-4f74-8db6-6b0d4777a419)

Azure will create a storage account for the Function App.  Make a note of the name - we will need to reference it later.

Once the resource has been deployed, go to **Settings** > **Identity** and enable "System Assigned" by turning the status switch to **On**.  Save this change:

![image](https://github.com/user-attachments/assets/c022adce-867f-40b1-b20e-3683637eb186)

Then, click on **Azure role assignments** and add a role assignment, **Storage Blob Data Owner**, to the storage account we noted previously.

![image](https://github.com/user-attachments/assets/5d39a43a-e542-4471-ad1d-0f58e5a007ae)

Next, go to **Settings** > **Environment variables** and look for the variable with a name like "AzureWebJobsStorage".  Change the name to `AzureWebJobsStorage__accountName` and the value to the name of the function app's storage account.  Copy the new variable name exactly - there are two underscores before "accountName".

![image](https://github.com/user-attachments/assets/c1dec46c-d600-4101-b64e-e90e8e1fee2a)

Now let's add the connection string for our Cosmos DB account.  While we are still in the **Environment Variable** settings page, open the **Connection strings** tab.  Click **+ Add** to create a new connection string.  Use the following values:

* **Name:** CosmosDbConnectionString
* **Value:** paste the primary connection string from your Cosmos DB account.  It will be formatted like "AccountEndpoint=https://<name>.documents.azure.com:443/;AccountKey=<string>;"
* **Type:** Document Db
	
> Note: You can choose any type for your connection string - it doesn't have to be **Document Db** - but if you change the type here, you'll also need to change the environment variable prefix in **/services/product.services.ts**.

![image](https://github.com/user-attachments/assets/7a0a3286-6fe9-49a4-acbf-df1034bd513a)

Click **Apply** twice and select **Confirm** when the UI warns that the app may restart.

![image](https://github.com/user-attachments/assets/1e8ccf96-f4ef-49e9-99e9-c93ac76713e0)


### CI/CD with Azure Pipelines

We need to automate the process of building our code into a package and deploying it into the function app.  For this, we'll use a Pipeline in Azure DevOps.  

From **Pipelines**, click **New Pipeline**.  Select **Azure Repos Git** as the code source:

![image](https://github.com/user-attachments/assets/614ebd00-488b-4d45-9766-f264c3a95d4b)
	
Choose the repository that we created earlier:

![image](https://github.com/user-attachments/assets/6796681b-b2aa-4bb0-aa2a-a9c05405a3fa)

In the **Configure** tab, click **Show more** to reveal the template named **Node.js Function App to Linux on Azure**.  You may need to scroll down - there are quite a few templates in the alphabetically-sorted list.

![image](https://github.com/user-attachments/assets/33e04348-9f9d-4226-be28-9fa14669f530)
	
A configuration sidebar will open up.  Select your Azure subscription and choose the name of your Function App from the drop-down menu.  Finally, click **Validate and configure**.

![image](https://github.com/user-attachments/assets/903cbca3-f45b-4d2a-b440-45b79584fa0e)
	
You will get a pipeline template named **azure-pipelines.yml**.  You can rename this if you prefer.  Before running, let's review the basic steps in the pipeline.

* **Trigger:** this defines when the pipeline will execute.  It's currently set to "main" which will execute whenever an update is pushed to the "main" branch of the repository.  You can change this to "none" if you only want to run the pipeline manually, but we'll leave it as-is.
* **Variables:** this section defines some variables referenced throughout the following tasks.  All of these should be automatically populated based on the selections we made in the configuration sidebar.
* **Stages:** this section has two named stages, "build" and "deploy".  Stages are optional constructs in the pipeline that help to group the tasks.
* **Tasks:** these perform each individual step in the build and deploy process when the pipeline runs on the agent virtual machine.

The tasks are as follows:
	1. Install Node.js version 20;
	2. Check for a file named 'extensions.csproj', and if present, install anything specified there;
	3. Install and run the npm package manager (this is the core build task);
	4. Zip the build files into an archive;
	5. Upload the archive to a "drop" directory where the **Deploy** task will find it;
	6. Finally, use AzureFunctionApp version 2 (**AzureFunctionApp@2**) to deploy the packaged build file to our Azure function app.

Let's save the pipeline and run it once to make sure everything works.  I've renamed mine to **api-build-pipeline.yml** and am about to commit the change and run it using the **Save and run** button:

![image](https://github.com/user-attachments/assets/209da1de-0ae3-4db7-9854-f8d5b0e6edeb)

You can watch the pipeline progress through its stages here.  When it reaches the **Deploy** stage, you will need to grant permissions to the environment.

![image](https://github.com/user-attachments/assets/b165f16d-0549-4a9c-8aa6-454d9633cf4c)

If all goes well, the blue "running" icons will all turn into green "completed" icons.  You can click on either of the stages to view details on each task, including console logs.  This can be extremely useful for troubleshooting pipeline failures.

![image](https://github.com/user-attachments/assets/7cabb221-983a-462a-9693-55bcc24e0711)
	
If we navigate to our Azure function app, we should see our five functions enabled and running:

![image](https://github.com/user-attachments/assets/00c4360c-25ff-4427-a6c3-b67d5baa1f3c)
							
Finally, let's test our API.  You can use an API client like Postman, construct a query directly with PowerShell or cURL, or use the Functions App's built-in **Code + Test** feature.  We'll try the latter method here.  Click on the function named **GetProducts**:

![image](https://github.com/user-attachments/assets/2e0c3377-bed1-46b7-b03e-c666e6eb4fae)

Click **Test/Run** in the menu bar:

![image](https://github.com/user-attachments/assets/98df56fd-2ce4-4082-bac8-0d6f816a9aa4)

In the sidebar, set the HTTP method to **GET** and click **Run**.

![image](https://github.com/user-attachments/assets/abc98b89-9a4b-47f8-99bb-cf36106d5675)

You should see the tab change from "Input" to "Output" and get a response code of **200 OK** with a large JSON object in the HTTP response content.

![image](https://github.com/user-attachments/assets/edfa652a-c0c9-4be9-be16-b6af9967ff46)
	
Congratulations - your API is up and running with CI/CD!  Before we move on to APIM integration, let's add tasks for GitHub Advanced Security to the pipeline.  Edit the pipeline file and paste this code into the Build stage after the **script** task that runs npm commands (around line 50):
	
	    # Advanced Security tasks -----------------
	    - task: AdvancedSecurity-Codeql-Init@1 
	      inputs:
	        languages: 'javascript'
	      displayName: 'Advanced Security Initialize CodeQL'
	    
	    - task: AdvancedSecurity-Dependency-Scanning@1
	      displayName: 'Advanced Security Dependency Scanning'
	    
	    - task: AdvancedSecurity-Codeql-Analyze@1
	      displayName: 'Advanced Security Code Scanning'
	    #------------------------------------------
	
![image](https://github.com/user-attachments/assets/6d5d8355-8601-4fe8-bf34-edd172ca2d34)

Compare your pipeline with the example provided in the /examples folder of the repository.  Validate and save the updated pipeline.  It will automatically kick off a run - there's no need to manually initiate a run:

![image](https://github.com/user-attachments/assets/f69f7a8d-77a6-400c-8442-bc64bbb1449f)
	
If all goes well, you may see some package vulnerability results in your run summary.

![image](https://github.com/user-attachments/assets/f92058b0-5248-4361-b95e-adf1d1f6bb41)

Navigate to **Repos** > **Advanced Security** to see more:

![image](https://github.com/user-attachments/assets/84d4106e-6b13-4dcd-9742-ff011e9f2209)

> Note: It may take some time for these findings to reflect in the Defender for Cloud recommendations.


### Code review

#### Project structure

It's time to review the source code for our serverless API.  We will start with an overview of the code itself, and check a few variable names to make sure they match the Azure resources we created in previous steps.

Open up the Azure DevOps repository - either in the web UI or in a local development environment like Visual Studio Code - and expand the **/src/** directory and its subdirectories: 

![image](https://github.com/user-attachments/assets/56f2aaa3-690f-443f-b452-4baa0d0fc311)

Refer to this block diagram for a simplified view of the process we'll detail in the next few paragraphs.

![image](https://github.com/user-attachments/assets/f9328d2a-b720-46ec-8922-415fb29f2750)

The file **index.ts** contains the definitions for each of our API operations.  Each definition specifies a method (GET, POST, PUT, or DELETE), a route (either `products` or `products/{id}`), an authentication level, and a handler.  The handler points the program to the function code in the Functions subdirectory.

Open up the file **QueryProducts.ts**.  You will see import statements that bring modules from the [@azure/functions npm package](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=typescript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4).  Another import statement references the **product.services.ts** file from /src/services/, which we will explore in a moment.  The rest of the **QueryProducts** file defines a function that parses an item ID from the body of the incoming API request, passes this parameter to the **query()** function in **product.services**, and returns the result with a successful 200 status or a 500 error upon failure.

If we inspect **/services/product.services.ts**, we will see the actual code that interfaces with Cosmos DB.  Line 4 creates a variable with our primary database connection string.  Lines 7-8 define variables for the database ID and container ID, respectively.  Check to ensure that your connection string name and type match the environment variable you created previously.  Azure Functions uses `process.env.` to reference an environment variable (whether local or in the Azure Function) and `DOCDBCONNSTR_` as the connection string type prefix.

We also need to verify that the **databaseId** and **containerId** values match our Cosmos DB database and container IDs.  The quick start tutorial will populate these fields for us, but if there is already a container with that name, the tutorial will add a serial number.  We need to match the values in **product.services.ts** with whichever container has the sample dataset loaded.

Continuing with our tour of the source code, **product.services.ts** contains a main function **init()** that creates a new Cosmos DB client out of our connection string, database ID, and container ID.  It will use this client to execute the **create()**, **read()**, **query()**, **update()**, and **delete()** functions.  The main one we're concerned with is **query()**, as it allows us to run a SQL query with a user-defined `id` parameter.  We will use this to test SQL injection alerts.  Our **query()** function defines the Cosmos DB method to query all items in the container and fetch all results.  The results are written to a variable named `queryResults` and returned to the calling function in **QueryProducts.ts**.

#### API operations

Our Function App defines five operations: get (read), update, create, query, and delete.  Let's take a look at each of these operations and how to interact with them.

##### Get products

* **HTTP method:** GET
* **Inputs:** none
* **Function:** This operation uses the @azure/cosmos SDK `items.readAll()` and `iterator.fetchAll()` objects to return every item in the container.
* **Example:** Send a GET to /products and watch for the large response to come in.  Note the response size - 185 KB!

![image](https://github.com/user-attachments/assets/0d0f3f02-d393-43c9-a051-ca540095e335)

##### Update product

* **HTTP method:** PATCH
* **Inputs:** `id` (in query), partition key and JSON Patch document in request body
* **Function:** This operation uses [Partial Document Update in Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/partial-document-update) to modify specified properties and fields in an item, without having to do a full document replace operation.  The request body must include a JSON array named "operations".  Valid operations are defined [here](https://learn.microsoft.com/en-us/azure/cosmos-db/partial-document-update#supported-operations) and include `add`, `set`, `replace`, `remove`, `increment`, and `move`.
* **Example:** Change the price of an item using the `set` operation, specifying the path `/price`, and changing the value.

![image](https://github.com/user-attachments/assets/243e5873-ac33-41ae-a5de-682c7f5ad5b9)

##### Create product

* **HTTP method:** POST
* **Inputs:** JSON object in request body
* **Function:** This operation uses the @azure/cosmos SDK `items.create()`object to create a new item with any new or existing fields.  Item id is optional.
* **Example:** Create a new item for a credit card with Luhn-compliant CCN, CVV, expiration date, and zip code fields.

![image](https://github.com/user-attachments/assets/27111294-0c57-4465-9b2a-056bc5e7e9ac)

##### Query product

* **HTTP method:** POST
* **Inputs:** SQL query as JSON object in request body
* **Function:** This operation passes a SQL query provided in the request body into the `items.query()` object.  **This is highly unsafe!**  SQL queries should be parameterized – at the very least – but this is sufficient for a proof of concept.
* **Example:** Query for the credit card item we created earlier, using the name field and a wildcard match.  Bonus: Turn off the `Ocp-Apim-Subscription-Key` header and set a new header `User-Agent: javascript:`

![image](https://github.com/user-attachments/assets/374c70de-6435-482a-8e7c-c5edc07c7061)

##### Delete product

* **HTTP method:** DELETE
* **Inputs:** `id` in query URL
* **Function:** This operation uses the @azure/cosmos SDK `items.delete()`object to delete the item referenced by its ID.
* **Example:** Delete the item we created previously.

![image](https://github.com/user-attachments/assets/7c7386c6-6f71-4530-9568-0f25a92bbd78)

### All about APIs

#### Create API Management service

We'll need an API Management (APIM) service to onboard our new API into Defender for APIs and define a good OpenAPI-compatible specification.  First, create a service with the following options:

* **Resource group:** Choose your project resource group or a separate resource group if you prefer.
* **Pricing tier:** Select **Consumption** for the least cost impact, or **Developer** if you plan to use virtual networks.

![image](https://github.com/user-attachments/assets/80f5bc32-f0a3-4728-9ead-c0e11109f352)

On the **Monitor + secure** tab, ensure that Defender for APIs is enabled at the subscription level or on this specific resource.  Enable Log Analytics and, optionally, Application Insights.

![image](https://github.com/user-attachments/assets/6eb772fe-a9bd-4896-957c-44c96adf0c1c)

Review and create the APIM resource.

#### Onboard API from Function App

Once the APIM resource is deployed, navigate to **APIs** > **APIs** > **+ Add API** and click the **Function App** tile under **Create from Azure resource**.

![image](https://github.com/user-attachments/assets/333d6cc7-703d-437d-8da9-c7006efcedec)

From the dialog box, click **Browse** to select your Function App:

![image](https://github.com/user-attachments/assets/984e295b-bb8f-47b9-8d0b-55d7418df6b4)

In the **Import Azure Functions** page, click **Select** on the right side of the Function text field to open a blade where you can select the Function App.  It will load and select all functions in the Function App.  We can choose to import only certain functions, but in our case, we'll leave them all checked and click **Select** at the bottom left of the page to return to the **Create from Function App dialog**.

![image](https://github.com/user-attachments/assets/a8b9a921-eb22-444a-92eb-5fb4a16d2b27)

Enter a friendly display name and API URL suffix:

![image](https://github.com/user-attachments/assets/c102f030-1f09-4908-b985-7bd814d3f879)

After a few moments, you will see your API and its five operations (CreateProduct, DeleteProduct, GetProducts, QueryProduct, UpdateProduct) in the **APIs** section of the APIM dashboard.

![image](https://github.com/user-attachments/assets/96b43149-9f12-4782-a508-32dc7014b73a)

To test unauthenticated API connections, you can turn off **Subscription required** from the **Settings** pane.  If enabled, you will need to provide a header named `Ocp-Apim-Subscription-Key` with one of the keys configured in **APIs** > **Subscriptions**.

![image](https://github.com/user-attachments/assets/e8ed2210-045a-401b-a066-2c42527ae36b)

#### Onboard to Defender for APIs

To enable Defender for APIs for this API, go to Microsoft Defender for Cloud and open the **Recommendations** pane.  Search for a recommendation named **Azure API Management APIs should be onboarded to Defender for APIs**:

![image](https://github.com/user-attachments/assets/c63fb359-ac9f-41b6-9c03-dad39afe7e5c)

Open the recommendation and find the API under **Affected resources** > **Unhealthy resources**.  Check the box next to the API and click **Fix**.

![image](https://github.com/user-attachments/assets/a6f08747-c985-430c-89e4-9fec4491db46)

Confirm the Quick Fix action and wait a moment for it to complete.  If you refresh the recommendation, you should now see the API listed in **Healthy resources**:

![image](https://github.com/user-attachments/assets/d4bccd1b-5de9-48c5-bf2e-53aaa93ecd4e)

Finally, we will check API Security Posture Management in Defender for Cloud.  Open **Workload protections** from the navigation sidebar and find a tile named **API security** in the **Advanced protection** section near the bottom of the page:

![image](https://github.com/user-attachments/assets/c531b421-0316-4127-bd24-c01cb818dd71)

Click on the name of the API collection to open the report.

![image](https://github.com/user-attachments/assets/f0c66f82-b280-427e-ae20-af3619b3aa1a)

#### OpenAPI Specification

Our API already works if we reach it directly from the Functions App, but managing it in APIM gives us a few benefits:
* Defender for APIs runtime protection (all APIs must be managed in APIM before they can be onboarded to Defender for Cloud)
* Decoupled domain name (instead of exposing the direct URL of the Function App)
* Fully defined OpenAPI specification in the APIM Frontend, which gives us the ability to restrict or require headers, parameters, and request JSON and set granular responses instead of a generic 200, 404, and 500 error template

That last benefit is extremely significant for API security.  Without a specification, an API request could contain anything including malformed data or even malicious content.  APIM allows us to define a JSON schema for each input and output, ensuring that client requests are syntactically valid and match expected values.

APIM will generate a minimal OpenAPI specification from our imported Azure Functions API, but it's not complete.  To view the default specification, go to the **Frontend** of the API and open the editor in either JSON or YAML format.

![image](https://github.com/user-attachments/assets/f8ad28bb-c92d-4b32-8b7d-8712f87800c8)

> Note: I will be using YAML in the following steps.  If you use the JSON editor, your line numbers will vary.

This API specification - as generated by APIM on import from Azure Functions - does not meet OpenAPI requirements and will fail any static security audit as an unscannable API because of two major problems.

![image](https://github.com/user-attachments/assets/dfb94cb2-33f0-4dce-bbc7-fe2067bd856c)

First, it is missing `type` property values for the `id` parameter referenced in our **delete** and **put** operations (lines 18 and 30 in the YAML template).  Second, it uses a `null` value for the description parameter of each response (lines 21, 33, 40, 47, and 54).

![image](https://github.com/user-attachments/assets/cc1b0d72-3af6-4b30-987b-596a2048248a)

If we only fix these two problems, our API will pass OpenAPI syntactical validation but will still fail security audit testing from services such as 42Crunch for a litany of issues ranging from authentication to response definitions and schemas:

![image](https://github.com/user-attachments/assets/db5f79f4-1395-4358-9d63-9ac4e7492fd1)
![image](https://github.com/user-attachments/assets/9e3abdaf-5499-4b21-9eb5-2fde9cd23a69)

For the purposes of testing code to cloud DevSecOps, it's not strictly necessary to fix any or all of these issues - in fact, it may be desirable to leave some issues open to demonstrate static security testing.  However, if you would like to start from a relatively clean slate and add your own vulnerabilities for demonstration purposes, you can replace the Frontend OpenAPI specification YAML with the contents of the template located at **/examples/OpenAPI-specification.yaml.template** in the source code repository.  Be sure to update line 7 with your APIM URL!

#### SAST with 42Crunch

Since we are testing DevSecOps practices, we need to try to automate security scanning of the OpenAPI specification, or OAS, without manually exporting and pushing files - this should all be done automatically.  We will create a second pipeline to automatically export the current OAS, scan it using 42Crunch's security audit service, and publish the results to GitHub Advanced Security.

> Note: This step requires an account on the [42Crunch Platform](https://platform.42crunch.com/login), either as a solo developer with a monthly subscription or as an invited user in an entitled organization.  If you do not have an account, skip to the next section to create a limited SAST pipeline with the 42Crunch Freemium task.

The first step is to install the [42Crunch Azure DevOps extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.cicd) in our organization.

Next, we can create a security audit pipeline.  I've provided an Azure Pipelines YAML file in the source code repository at **/examples/api-security-audit-pipeline.yml** that we can use as a template.  As we did with the build pipeline, click **New pipeline**, select **Azure Repos Git** for your code location, and select your repository name:

![image](https://github.com/user-attachments/assets/e3714f28-2413-492d-9c6d-77bab169c311)

![image](https://github.com/user-attachments/assets/9698a8c4-c2c9-46e2-98ce-7b0381f874b4)

From **Configure your pipeline**, choose **Existing Azure Pipelines YAML file**:

![image](https://github.com/user-attachments/assets/11e125c5-ea20-45ef-af8b-6d36e28e37a4)

In the sidebar, choose the security audit pipeline template from the **/examples/** directory and select **Continue**:

![image](https://github.com/user-attachments/assets/32697eac-2e68-4eb9-8ecd-ef0da29cceb9)

Let's review the pipeline YAML.

* **Trigger:** none.  We will run this pipeline on demand, but this can be integrated into a build pipeline with security gates enforced to block builds if the audit fails.
* **Tasks:**
  * `UsePythonVersion@0` - Install Python 3.11 if it is not already present on the agent.
  * `AzureCLI@2` - Run a short Azure CLI command to export the API specification as a YAML file in the build agent's local path.  This will place the current API spec in our pipeline working directory for the security audit task to discover and scan.  Required parameters include the resource group name, APIM service name, and API name.  You will need a service connection to Azure Resource Manager.
  * `APIContractSecurityAudit@5` - This task locates and scans the YAML file exported by the previous command.  The service will discover any OpenAPI-compatible YAML or JSON file in the repository or the working directory of the build agent.  In our case, we should not have any OpenAPI specifications in the repo so the service will only discover the file created by our Azure CLI command.
  * `PublishBuildArtifacts@1` - This task publishes the scan results to pipeline artifacts as a SARIF file.
  * `AdvancedSecurity-Publish@1`- This task formats and uploads the SARIF file produced by the API Security Audit action to the Advanced Security service so that we can view it in security dashboards and reports.
 
After you run the pipeline, wait a few moments for results to be published to Defender for Cloud.  They will appear as Findings in the recommendation titled **Azure DevOps repositories should have code scanning findings resolved**.

![image](https://github.com/user-attachments/assets/d24520fe-fede-4667-9857-003cdde823e1)


#### [Optional] SAST with 42Crunch (Freemium version)

There is a completely free version of the 42Crunch security audit solution, but it comes with a few tradeoffs compared to the full version.  There is a monthly limit to the number of scans you can run, and the results are generated in a slightly different format that requires an additional step to upload into GitHub Advanced Security.  However, there is no platform login or monthly subscription required.

First, install the [Freemium extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.42c-cicd-audit-freemium) to your Azure DevOps organization.

When creating the pipeline from a file, use the `api-security-audit-freemium-pipeline.yml` template.  Some of the tasks are slightly different:

* **Trigger:** None - no change here
* **Tasks:**
  * `UsePythonVersion@0` - no change here
  * `APISecurityAuditFreemium@1` - the Freemium task doesn't allow us to specify the root directory for discovery.  It will only discover JSON and YAML files that are in the repo.
  * `Bash@3` - This task uses `sed` to post-process the SARIF scan results so that they will be accepted by Github Advanced Security.  The first `sed` command changes all location URIs from absolute paths to relative paths.  The second `sed` command fixes a bug with rule IDs referencing unexpected values by resetting all rule IDs to zero.
  * `PublishBuildArtifacts@1` - no change here
  * `AdvancedSecurity-Publish@1` - no change here

Because the Freemium version will not discover files in the local path of the build agent - only files that were cloned from the repository during the pipeline run - we have to manually export the OAS file from Azure and upload it to the repository.  The Freemium scanner will decrement your monthly scan quota for each OAS file it discovers on every run; be sure to only keep one YAML or JSON specification in your repository at a time!



### Now we can do fun stuff

#### Secret scanning and push protection

Decode this string from Base64 using Cyberchef or another tool of your choice:

`NVlpeEk3WDEzZzlDUWZDQzFlMWRDeUxUU1J6RThJNXE0ZUlYSVp0Rmw2VkwwTTdxYUFnbDdsY0RnY0RjclZBcnk5cGxwRGtHb2ZudUFDRGJEYjlrenc9PQ==`

> Note: This is a real Cosmos DB key that has long since been rotated.  Store only in encoded form if you have any kind of sensitive information inspection enabled!

Add the decoded secret to a file and commit your changes.  GitHub Advanced Security will block the push.  To override the block, put this string in your commit message:

`skip-secret-scanning:true`

You will see an alert in **Advanced Security** > **Secrets** that looks similar to this one:

![image](https://github.com/user-attachments/assets/ded93093-5766-4ef8-bf7b-14f2335da994)

#### Suspicious user-agent

Set a header in your API tool to the following: `"User-Agent": "javascript"`

The result will look similar to this:

![image](https://github.com/user-attachments/assets/44e81fd2-d5bb-4a29-8f0f-018c57f57d0a)

#### SQL injection

Use the following JSON body in your **QueryProduct** request:

    {
      "query": "SELECT * FROM c WHERE c.name LIKE '' OR '1'='1'--"
    }

Sample alert:

![image](https://github.com/user-attachments/assets/c8bacd09-8a34-4741-a443-e09a1aa1fcae)



## Troubleshooting

### Successful deployment, but no functions load in Azure Function App

You may experience a successful pipeline run that doesn't deploy any functions in your Function App.  The Function App will appear to be working properly with a valid runtime version, but it will not list any of the functions that should be present:

![image](https://github.com/user-attachments/assets/6bbfcb36-12b5-4feb-bc5f-a75bf45006b2)

Your pipeline might appear to have completed successfully, and the build artifact will even exist:

![image](https://github.com/user-attachments/assets/67ce6019-0bd3-428f-83e5-200c43655186)

However, a close look at the Build stage may reveal an error in the Prepare binaries task.  In this case, there is a syntactical error in one of the Typescript files that defines a function.

![image](https://github.com/user-attachments/assets/ca373562-e1c0-44c5-9d29-e436c9a730fd)

Correct the error and re-run the pipeline, and the functions will deploy into the Function App.

### Shared key access / local authentication

If your functions are suddently not loading or any other strange behavior happens in this lab environment, check whether **Shared key access** is enabled on the storage account and whether **Disable local authentication** is on or off.  Fix these settings in Azure CLI:

    RESOURCEGROUP="<name of resource group>"
	  STORAGEACCOUNT="<name of storage account>"
	  COSMOSDB="<name of Cosmos DB account>"
		 
    az storage account update `
    --resource-group $RESOURCEGROUP `
    --name $STORAGEACCOUNT `
    --set allowSharedKeyAccess=true `
    --output none `
    && az resource update `
    --resource-group $RESOURCEGROUP `
    --name $COSMOSDB `
    --resource-type "Microsoft.DocumentDB/databaseAccounts" `
    --set properties.disableLocalAuth=false `
    --output none

### View full text of Cosmos DB queries

It can sometimes be helpful to see exactly what the API is sending as a query to Cosmos DB.  Since we enabled full text query logging, we can check this from the `CDBQueryRuntimeStatistics` table in the Log Analytics Workspace that is receiving logs from Cosmos DB.  Use this KQL as a starting point:

    CDBQueryRuntimeStatistics
    | where AccountName == "<your Cosmos DB account name>"
    | sort by TimeGenerated desc
    | limit 10
    | project TimeGenerated, QueryText

Sample:

![image](https://github.com/user-attachments/assets/b6479611-3620-4b22-937c-f1b563e386ab)


