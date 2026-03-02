import asyncHandler from "express-async-handler";
import { Task, Notification } from "../../Models/index.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignTo, priority, deadline, category, sop } =
    req.body;
  if (!title) throw new ApiError(400, "Task title is required");

  const task = await Task.create({
    title,
    description,
    assignTo: assignTo ? (Array.isArray(assignTo) ? assignTo : [assignTo]) : [],
    priority,
    deadline,
    category,
    sop,
    voiceNote: req.file?.path ?? null,
    organizationID: req.organizationID,
  });

  return res.status(201).json(new ApiResponse(201, task, "Task created"));
});

// ─── GET /api/tasks ──────────────────────────────────────────────────────────
export const getAllTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, assignTo } = req.query;
  const query = { ...req.orgFilter };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignTo) query.assignTo = assignTo;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignTo", "displayName profilePhoto")
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit),
    Task.countDocuments(query),
  ]);

  return res.json(
    new ApiResponse(200, {
      tasks,
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit),
    }),
  );
});

// ─── GET /api/tasks/emp ──────────────────────────────────────────────────────
export const getTasksForEmployees = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignTo: req.user._id })
    .populate("assignTo", "displayName profilePhoto")
    .sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, tasks));
});

// ─── GET /api/tasks/:id ──────────────────────────────────────────────────────
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignTo")
    .populate("sop");
  if (!task) throw new ApiError(404, "Task not found");
  return res.json(new ApiResponse(200, task));
});

// ─── PUT /api/tasks/:id ──────────────────────────────────────────────────────
export const updateTask = asyncHandler(async (req, res) => {
  const old = await Task.findById(req.params.id);
  if (!old) throw new ApiError(404, "Task not found");

  const update = { ...req.body };
  if (req.file) update.voiceNote = req.file.path;
  if (update.status === "In Progress" && old.status === "Pending")
    update.startTime = new Date();
  if (update.status === "Completed" && old.status === "In Progress") {
    update.endTime = new Date();
    if (old.startTime)
      update.totalTimeSpent = Math.floor(
        (Date.now() - new Date(old.startTime)) / 1000,
      );
  }

  const task = await Task.findByIdAndUpdate(req.params.id, update, {
    new: true,
  }).populate("assignTo");
  return res.json(new ApiResponse(200, task, "Task updated"));
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  return res.json(new ApiResponse(200, {}, "Task deleted"));
});

// ─── PATCH /api/tasks/seen ────────────────────────────────────────────────────
export const markTaskSeen = asyncHandler(async (req, res) => {
  await Task.updateMany(
    { ...req.orgFilter, isNew: true },
    { $set: { isNew: false } },
  );
  return res.json(new ApiResponse(200, {}, "Tasks marked as seen"));
});

export const getTasksByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, assignTo } = req.query;
  const query = { ...req.orgFilter };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignTo) query.assignTo = assignTo;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignTo", "displayName profilePhoto")
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit),
    Task.countDocuments(query),
  ]);

  return res.json(
    new ApiResponse(200, {
      tasks,
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit),
    }),
  );
});
