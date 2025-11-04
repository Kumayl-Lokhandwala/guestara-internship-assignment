# Menu Management Backend

This is a Node.js backend server built with Express and MongoDB to manage a restaurant menu. It provides a complete API for managing a three-level menu hierarchy: **Categories**, **Subcategories**, and **Items**.

### Tech Stack

- **Node.js** (v18+)
- **Express.js** (for the API server)
- **MongoDB** (as the NoSQL database)
- **Mongoose** (as the ODM for MongoDB)
- **ES Modules** (using `import`/`export` syntax)

---

## How to Run Locally

### Prerequisites

- **Node.js & npm:** You must have Node.js (v18 or higher) and npm installed.
- **MongoDB:** You need a MongoDB connection string. You can get one for free from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or by running MongoDB locally.

### Installation & Setup

1.  **Clone the Repository**
    (Or, if you have the files, just navigate to the project folder.)

2.  **Install Dependencies**
    Open your terminal in the project's root folder and run:

    ```bash
    npm install
    ```

3.  **Create Your Environment File**
    Create a new file in the root directory named `.env`. This file is **required** for the application to run.

4.  **Add Environment Variables**
    Open your new `.env` file and add the following, replacing the placeholders with your own values:

    ```
    # The port your server will run on
    PORT=5000

    # Your MongoDB connection string
    MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/yourDatabaseName
    ```

5.  **Run the Server**
    You're all set! Run the server with:

    ```bash
    npm start
    ```

    This command uses `nodemon`, so the server will automatically restart if you make any code changes.

    **✅ You should see this in your terminal:**

    ```
    Server is running on http://localhost:5000
    MongoDB Connected: your-cluster-host
    ```

    Your API is now running and ready to be tested with tools like Postman or Thunder Client.

---

## API Test Examples (Postman)

Here are examples of how to test the key API endpoints.

### 1. Create a Category

**`POST /api/category`**

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/category`
- **Body:** `raw` (JSON)
- **Response:** `201 Created`

![Create Category Screenshot](docs/images/01-create-category.png)

---

### 2. Create a Subcategory

**`POST /api/category/:categoryId/subcategory`**

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/category/YOUR_CATEGORY_ID`
- **Body:** `raw` (JSON)
- **Response:** `201 Created`

![Create Subcategory Screenshot](docs/images/02-create-subcategory.png)

---

### 3. Create an Item

**`POST /api/item`**

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/item`
- **Body:** `raw` (JSON) - Remember to include `subcategoryId` or `categoryId`.
- **Response:** `201 Created`

![Create Item Screenshot](docs/images/03-create-item.png)

---

### 4. Get All Categories (Populated)

**`GET /api/category/all`**

- **Method:** `GET`
- **Response:** `200 OK`
- **Note:** The screenshot should show the `subcategories` and `items` arrays being populated with full objects, not just IDs.

![Get All Categories Screenshot](docs/images/04-get-all-categories.png)

---

### 5. Search for an Item (Query Params)

**`GET /api/item/search?name=...`**

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/item/search`
- **Params:** Set a `Key` of `name` and a `Value` of your search term.
- **Response:** `200 OK`

![Search Item Screenshot](docs/images/05-search-item.png)

---

### 6. Edit an Item

**`PUT /api/item/:id`**

- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/item/YOUR_ITEM_ID`
- **Body:** `raw` (JSON) - Include only the fields you want to change.
- **Response:** `200 OK` - Note the `totalAmount` is recalculated.

![Edit Item Screenshot](docs/images/06-edit-item.png)

---

## Project Q&A

### Which database you have chosen and why?

We chose **MongoDB** (using Mongoose as the ODM). Its NoSQL, document-based structure is ideal for this project's hierarchical data (Category $\rightarrow$ Subcategory $\rightarrow$ Item). This is more flexible and feels more natural than forcing the nested menu into rigid SQL tables. Mongoose also provides powerful tools like `.populate()` and virtuals, which were very helpful.

### 3 things that you learned from this assignment?

1.  **Mongoose Virtual Properties:** How to use `itemSchema.virtual('totalAmount')` to create a dynamically calculated field (`baseAmount - discount`) that isn't saved in the database. This prevents data inconsistency and is much more efficient.
2.  **ES Module Import Rules:** That when using `"type": "module"` in `package.json`, all local file imports _must_ include the full file extension (e.g., `import Item from '../models/Item.js'`). This was the cause of the `ERR_MODULE_NOT_FOUND` error.
3.  **MongoDB Transactions:** How to use `mongoose.startSession()` to wrap multiple database operations (like creating an item _and_ updating its parent category's `items` array) into a single, atomic transaction. This ensures that if one part fails, the entire operation is rolled back, keeping the data clean.

### What was the most difficult part of the assignment?

The most difficult part was implementing the logic for **creating an Item with its flexible parentage**. The requirement was that an Item must belong to _either_ a Category _or_ a Subcategory, but _not both_. This required a custom Mongoose validation hook (`.pre('validate')`) to enforce the rule and transactional logic in the controller to correctly update the correct parent's `items` array.

### What you would have done differently given more time?

Given more time, the highest priority would be to add **authentication and authorization**. Right now, all API endpoints are public. I would implement user roles (e.g., "admin", "staff") and use **JWT (JSON Web Tokens)** to protect the `POST`, `PUT`, and `DELETE` routes, ensuring that only authorized users can modify the menu.
