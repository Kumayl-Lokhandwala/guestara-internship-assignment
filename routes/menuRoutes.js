import express from "express";
import {
  // Create
  createCategory,
  createSubcategory,
  createItem,

  // Get
  getAllCategories,
  getCategoryByIdOrName,
  getAllSubcategories,
  getSubcategoriesByCategoryId,
  getSubcategoryByIdOrName,
  getAllItems,
  getItemsByCategoryId,
  getItemsBySubcategoryId,
  getItemByIdOrName,

  // Edit
  editCategory,
  editSubcategory,
  editItem,

  // Search
  searchItemByName,
} from "../controllers/menuController.js";

const router = express.Router();

// --- CREATE ROUTES ---
router.post("/category", createCategory);
router.post("/category/:categoryId/subcategory", createSubcategory);
router.post("/item", createItem);

// --- GET ROUTES ---
router.get("/category/all", getAllCategories);
router.get("/category/:idOrName", getCategoryByIdOrName);
router.get("/subcategory/all", getAllSubcategories);
router.get(
  "/category/:categoryId/subcategory/all",
  getSubcategoriesByCategoryId
);
router.get("/subcategory/:idOrName", getSubcategoryByIdOrName);
router.get("/item/all", getAllItems);
router.get("/category/:categoryId/item/all", getItemsByCategoryId);
router.get("/subcategory/:subcategoryId/item/all", getItemsBySubcategoryId);
// --- SEARCH ROUTE ---
// IMPORTANT: This must be *before* the '/item/:idOrName' route
// otherwise 'search' will be treated as an idOrName.
router.get("/item/search", searchItemByName);
router.get("/item/:idOrName", getItemByIdOrName);

// --- EDIT (UPDATE) ROUTES ---
router.put("/category/:id", editCategory);
router.put("/subcategory/:id", editSubcategory);
router.put("/item/:id", editItem);

export default router;
