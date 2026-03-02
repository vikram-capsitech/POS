import MenuItem from "../../Models/pos/MenuItem.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  POST /api/menu
// ─────────────────────────────────────────────
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, category, price, prepTime, isVeg, ingredients, spiceLevel } =
    req.body;
  const imageUrl = req.file?.path ?? req.body.imageUrl;

  if (
    !name ||
    !category ||
    price === undefined ||
    !prepTime ||
    isVeg === undefined ||
    !imageUrl
  ) {
    throw new ApiError(
      400,
      "name, category, price, prepTime, isVeg, and imageUrl are required",
    );
  }

  const item = await MenuItem.create({
    restaurantId: req.organizationID,
    name,
    category,
    price: Number(price),
    prepTime: Number(prepTime),
    spiceLevel: spiceLevel ? Number(spiceLevel) : undefined,
    isVeg: Boolean(isVeg),
    ingredients: ingredients ?? [],
    imageUrl,
  });

  res
    .status(201)
    .json({ success: true, message: "Menu item created", data: item });
});

// ─────────────────────────────────────────────
//  GET /api/menu
// ─────────────────────────────────────────────
const getAllMenuItems = asyncHandler(async (req, res) => {
  const { category, available, isVeg, page = 1, limit = 20 } = req.query;
  const query = { restaurantId: req.organizationID };
  if (category) query.category = category;
  if (available !== undefined) query.available = available === "true";
  if (isVeg !== undefined) query.isVeg = isVeg === "true";

  const [items, total] = await Promise.all([
    MenuItem.find(query)
      .sort({ category: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    MenuItem.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: items,
  });
});

// ─────────────────────────────────────────────
//  GET /api/menu/categories  (distinct categories)
// ─────────────────────────────────────────────
const getMenuCategories = asyncHandler(async (req, res) => {
  const categories = await MenuItem.distinct("category", {
    restaurantId: req.organizationID,
  });
  res.json({ success: true, data: categories });
});

// ─────────────────────────────────────────────
//  GET /api/menu/:id
// ─────────────────────────────────────────────
const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new ApiError(404, "Menu item not found");
  res.json({ success: true, data: item });
});

// ─────────────────────────────────────────────
//  PUT /api/menu/:id
// ─────────────────────────────────────────────
const updateMenuItem = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) updateData.imageUrl = req.file.path;
  if (updateData.price) updateData.price = Number(updateData.price);
  if (updateData.prepTime) updateData.prepTime = Number(updateData.prepTime);

  const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new ApiError(404, "Menu item not found");

  res.json({ success: true, message: "Menu item updated", data: item });
});

// ─────────────────────────────────────────────
//  PATCH /api/menu/:id/availability
// ─────────────────────────────────────────────
const toggleAvailability = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new ApiError(404, "Menu item not found");

  item.available = !item.available;
  await item.save();

  res.json({
    success: true,
    message: `Item marked as ${item.available ? "available" : "unavailable"}`,
    data: item,
  });
});

// ─────────────────────────────────────────────
//  DELETE /api/menu/:id
// ─────────────────────────────────────────────
const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, "Menu item not found");
  res.json({ success: true, message: "Menu item deleted" });
});

const getMenuItems = asyncHandler(async (req, res) => {
  const { category, available, isVeg, page = 1, limit = 20 } = req.query;
  const query = { restaurantId: req.organizationID };
  if (category) query.category = category;
  if (available !== undefined) query.available = available === "true";
  if (isVeg !== undefined) query.isVeg = isVeg === "true";

  const [items, total] = await Promise.all([
    MenuItem.find(query)
      .sort({ category: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    MenuItem.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: items,
  });
});

export {
  createMenuItem,
  getAllMenuItems,
  getMenuCategories,
  getMenuItemById,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  getMenuItems,
};
