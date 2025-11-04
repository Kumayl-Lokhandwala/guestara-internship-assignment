import mongoose from "mongoose";
import Item from "../models/item.js";
import Category from "../models/category.js";
import Subcategory from "../models/subcategory.js";

// --- CREATE ---

/**
 * @desc    Create a new Category
 * @route   POST /api/category
 * @access  Public
 */
export const createCategory = async (req, res) => {
  try {
    const { name, image, description, taxApplicability, tax, taxType } =
      req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      name,
      image,
      description,
      taxApplicability,
      tax,
      taxType,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new Subcategory under a Category
 * @route   POST /api/category/:categoryId/subcategory
 * @access  Public
 */
export const createSubcategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { categoryId } = req.params;
    let { name, image, description, taxApplicability, tax } = req.body;

    const category = await Category.findById(categoryId).session(session);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Defaulting logic as per your requirements
    if (taxApplicability === undefined) {
      taxApplicability = category.taxApplicability; // Default from category
    }
    if (tax === undefined) {
      tax = category.tax; // Default from category
    }

    const subcategory = new Subcategory({
      name,
      image,
      description,
      taxApplicability,
      tax,
      category: categoryId,
    });

    const createdSubcategory = await subcategory.save({ session });

    // Add this new subcategory to its parent category's list
    category.subcategories.push(createdSubcategory._id);
    await category.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdSubcategory);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new Item
 * @route   POST /api/item
 * @access  Public
 */
export const createItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      name,
      image,
      description,
      taxApplicability,
      tax,
      baseAmount,
      discount,
      categoryId,
      subcategoryId, // The parent ID
    } = req.body;

    // The validation hook in Item.js will ensure only one of
    // categoryId or subcategoryId is provided.

    const item = new Item({
      name,
      image,
      description,
      taxApplicability,
      tax,
      baseAmount,
      discount,
      category: categoryId,
      subcategory: subcategoryId,
    });

    const createdItem = await item.save({ session });

    // Now, add this item's ID to its parent's 'items' array
    if (categoryId) {
      const category = await Category.findById(categoryId).session(session);
      if (!category) throw new Error("Parent category not found");
      category.items.push(createdItem._id);
      await category.save({ session });
    } else if (subcategoryId) {
      const subcategory = await Subcategory.findById(subcategoryId).session(
        session
      );
      if (!subcategory) throw new Error("Parent subcategory not found");
      subcategory.items.push(createdItem._id);
      await subcategory.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdItem);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// --- GET ---

/**
 * @desc    Get all Categories
 * @route   GET /api/category/all
 * @access  Public
 */
export const getAllCategories = async (req, res) => {
  try {
    // Populate shows the full documents, not just IDs
    const categories = await Category.find({})
      .populate("subcategories")
      .populate("items");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single Category by ID or Name
 * @route   GET /api/category/:idOrName
 * @access  Public
 */
export const getCategoryByIdOrName = async (req, res) => {
  try {
    const { idOrName } = req.params;
    let category;

    // Check if the param is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(idOrName)) {
      category = await Category.findById(idOrName)
        .populate("subcategories")
        .populate("items");
    } else {
      // If not an ID, search by name
      category = await Category.findOne({ name: idOrName })
        .populate("subcategories")
        .populate("items");
    }

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all Subcategories
 * @route   GET /api/subcategory/all
 * @access  Public
 */
export const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find({}).populate("items");
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all Subcategories under a specific Category
 * @route   GET /api/category/:categoryId/subcategory/all
 * @access  Public
 */
export const getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({
      category: categoryId,
    }).populate("items");

    if (!subcategories) {
      return res
        .status(404)
        .json({ message: "No subcategories found for this category" });
    }
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single Subcategory by ID or Name
 * @route   GET /api/subcategory/:idOrName
 * @access  Public
 */
export const getSubcategoryByIdOrName = async (req, res) => {
  try {
    const { idOrName } = req.params;
    let subcategory;

    if (mongoose.Types.ObjectId.isValid(idOrName)) {
      subcategory = await Subcategory.findById(idOrName).populate("items");
    } else {
      subcategory = await Subcategory.findOne({ name: idOrName }).populate(
        "items"
      );
    }

    if (subcategory) {
      res.json(subcategory);
    } else {
      res.status(404).json({ message: "Subcategory not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all Items
 * @route   GET /api/item/all
 * @access  Public
 */
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({});
    // We get 'totalAmount' for free thanks to the virtual property in Item.js
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all Items under a specific Category
 * @route   GET /api/category/:categoryId/item/all
 * @access  Public
 */
export const getItemsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = await Item.find({ category: categoryId });

    if (!items) {
      return res
        .status(404)
        .json({ message: "No items found for this category" });
    }
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all Items under a specific Subcategory
 * @route   GET /api/subcategory/:subcategoryId/item/all
 * @access  Public
 */
export const getItemsBySubcategoryId = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const items = await Item.find({ subcategory: subcategoryId });

    if (!items) {
      return res
        .status(404)
        .json({ message: "No items found for this subcategory" });
    }
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single Item by ID or Name
 * @route   GET /api/item/:idOrName
 * @access  Public
 */
export const getItemByIdOrName = async (req, res) => {
  try {
    const { idOrName } = req.params;
    let item;

    if (mongoose.Types.ObjectId.isValid(idOrName)) {
      item = await Item.findById(idOrName);
    } else {
      item = await Item.findOne({ name: idOrName });
    }

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- EDIT (UPDATE) ---

/**
 * @desc    Edit a Category by ID
 * @route   PUT /api/category/:id
 * @access  Public
 */
export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, description, taxApplicability, tax, taxType } =
      req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, image, description, taxApplicability, tax, taxType },
      { new: true, runValidators: true } // Return the updated doc and run schema validation
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Edit a Subcategory by ID
 * @route   PUT /api/subcategory/:id
 * @access  Public
 */
export const editSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, description, taxApplicability, tax } = req.body;

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name, image, description, taxApplicability, tax },
      { new: true, runValidators: true }
    );

    if (!updatedSubcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    res.json(updatedSubcategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Edit an Item by ID
 * @route   PUT /api/item/:id
 * @access  Public
 */
export const editItem = async (req, res) => {
  try {
    const { id } = req.params;
    // We don't allow changing the parent (category/subcategory) in a simple edit
    const {
      name,
      image,
      description,
      taxApplicability,
      tax,
      baseAmount,
      discount,
    } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { name, image, description, taxApplicability, tax, baseAmount, discount },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    // The 'totalAmount' virtual will be automatically recalculated
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SEARCH ---

/**
 * @desc    Search for an Item by name
 * @route   GET /api/item/search
 * @access  Public
 */
export const searchItemByName = async (req, res) => {
  try {
    const { name } = req.query; // Get search term from query param (e.g., ?name=Pizza)

    if (!name) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }

    const items = await Item.find({
      name: { $regex: name, $options: "i" }, // 'i' for case-insensitive
    });

    if (items.length === 0) {
      return res
        .status(404)
        .json({ message: "No items found matching that name" });
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
