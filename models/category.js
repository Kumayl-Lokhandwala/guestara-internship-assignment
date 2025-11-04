import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
      type: String, // URL
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    taxApplicability: {
      type: Boolean,
      default: false,
    },
    tax: {
      type: Number,
      default: 0,
    },
    taxType: {
      type: String,
      enum: ["Percentage", "Fixed", "None"], // Restrict values
      default: "None",
    },
    // Link to Subcategories
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory",
      },
    ],
    // Link to Items (for items directly under this category)
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
