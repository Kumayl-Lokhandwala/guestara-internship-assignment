import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
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
    taxApplicability: {
      type: Boolean,
      default: false,
    },
    tax: {
      type: Number,
      default: 0,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Parent links
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: false,
    },
  },
  {
    timestamps: true,
    // These lines are crucial for virtuals to work!
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Virtual Property for totalAmount ---
// This calculates 'totalAmount' on the fly without saving it to the database.
// This is the best practice to prevent data mismatch.
itemSchema.virtual("totalAmount").get(function () {
  return this.baseAmount - this.discount;
});

// --- Validation Hook ---
// This runs before saving to ensure an item belongs to EITHER
// a category OR a subcategory, but not both.
itemSchema.pre("validate", function (next) {
  if (this.category && this.subcategory) {
    next(new Error("Item cannot belong to both a Category and a Subcategory."));
  }
  if (!this.category && !this.subcategory) {
    next(new Error("Item must belong to either a Category or a Subcategory."));
  }
  next();
});

const Item = mongoose.model("Item", itemSchema);
export default Item;
