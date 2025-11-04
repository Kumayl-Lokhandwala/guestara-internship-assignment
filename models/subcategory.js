import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // URL
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    // These will be set during creation, defaulting from the parent category
    taxApplicability: {
      type: Boolean,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    // Link to parent Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Link to Items
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  { timestamps: true }
);

const Subcategory = mongoose.model("Subcategory", subcategorySchema);
export default Subcategory;
