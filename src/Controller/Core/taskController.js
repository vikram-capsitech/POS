const Task = require("../Models/Task");
const { sendBulkNotification } = require("../Services/notificationService");
const asyncHandler = require("../Utils/asyncHandler");
const ApiError = require("../Utils/ApiError");

// ─────────────────────────────────────────────
//  POST /api/tasks
// ─────────────────────────────────────────────
const createTask = asyncHandler(async (req, res) => {
  const restaurantID = req.organizationID;
  if (!req.body.title) throw new ApiError(400, "Task title is required");

  const task = await Task.create({
    ...req.body,
    restaurantID,
    voiceNote: req.file?.path ?? null,
  });

  // Notify assigned employees
  if (task.assignTo?.length) {
    const assignees = Array.isArray(task.assignTo)
      ? task.assignTo
      : [task.assignTo];
    const deadline = task.deadline
      ? new Date(task.deadline.endDate).toLocaleDateString()
      : "No deadline";

    await sendBulkNotification(
      assignees,
      "info",
      "task",
      "New Task Assigned",
      `You have been assigned: ${task.title}. Deadline: ${deadline}`,
      { taskId: task._id.toString(), priority: task.priority },
    );
  }

  res.status(201).json({ success: true, data: task });
});

// ─────────────────────────────────────────────
//  GET /api/tasks
// ─────────────────────────────────────────────
const getTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    category,
    assignTo,
  } = req.query;
  const query = { ...req.orgFilter };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (assignTo) query.assignTo = assignTo;

  const [tasks, total, newCount] = await Promise.all([
    Task.find(query)
      .populate("assignTo", "name position profilePhoto")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Task.countDocuments(query),
    Task.countDocuments({ ...query, isNew: true }),
  ]);

  res.json({
    success: true,
    count: total,
    newTasksCount: newCount,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: tasks,
  });
});

// ─────────────────────────────────────────────
//  GET /api/tasks/my  (employee's assigned tasks)
// ─────────────────────────────────────────────
const getMyTasks = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { assignTo: req.user.id };
  if (status) query.status = status;

  const tasks = await Task.find(query)
    .populate("assignTo", "name position")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: tasks.length, data: tasks });
});

// ─────────────────────────────────────────────
//  POST /api/tasks/filter
// ─────────────────────────────────────────────
const getTasksByFilter = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    assignTo,
    priority,
    status,
  } = req.body;
  const query = { ...req.orgFilter };
  const orConditions = [];

  if (category?.length) orConditions.push({ category: { $in: category } });
  if (assignTo?.length) orConditions.push({ assignTo: { $in: assignTo } });
  if (priority?.length) orConditions.push({ priority: { $in: priority } });
  if (status?.length) orConditions.push({ status: { $in: status } });
  if (orConditions.length) query.$or = orConditions;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignTo", "name position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: tasks,
  });
});

// ─────────────────────────────────────────────
//  GET /api/tasks/:id
// ─────────────────────────────────────────────
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignTo")
    .populate("sop");
  if (!task) throw new ApiError(404, "Task not found");
  res.json({ success: true, data: task });
});

// ─────────────────────────────────────────────
//  PUT /api/tasks/:id
// ─────────────────────────────────────────────
const updateTask = asyncHandler(async (req, res) => {
  const oldTask = await Task.findById(req.params.id);
  if (!oldTask) throw new ApiError(404, "Task not found");

  // Auto-set timer fields on status transitions
  if (req.body.status) {
    if (req.body.status === "In Progress" && oldTask.status === "Pending") {
      req.body.startTime = new Date();
    }
    if (req.body.status === "Completed" && oldTask.status === "In Progress") {
      req.body.endTime = new Date();
      if (oldTask.startTime) {
        req.body.totalTimeSpent = Math.floor(
          (new Date() - new Date(oldTask.startTime)) / 1000,
        );
      }
    }
  }

  if (req.file) req.body.voiceNote = req.file.path;

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate("assignTo");

  // Socket event when completed
  if (task.status === "Completed") {
    req.app.get("io")?.to(`ADMIN_${task.restaurantID}`).emit("TASK_EVENT", {
      event: "STATUS_CHANGED",
      taskId: task._id,
      status: task.status,
    });
  }

  // Push notification on status change
  if (oldTask.status !== req.body.status && task.assignTo?.length) {
    const assignees = Array.isArray(task.assignTo)
      ? task.assignTo.map((a) => a._id ?? a)
      : [task.assignTo._id ?? task.assignTo];

    const titleMap = {
      "In Progress": "Task Started",
      Completed: "Task Completed",
    };
    const msgMap = {
      "In Progress": `You have started: "${task.title}"`,
      Completed: `Congratulations! You completed: "${task.title}"`,
    };

    await sendBulkNotification(
      assignees,
      req.body.status === "Completed" ? "success" : "info",
      "task",
      titleMap[req.body.status] ?? "Task Status Updated",
      msgMap[req.body.status] ?? `"${task.title}" is now ${req.body.status}`,
      { taskId: task._id.toString(), status: req.body.status },
    );
  }

  res.json({ success: true, data: task });
});

// ─────────────────────────────────────────────
//  DELETE /api/tasks/:id
// ─────────────────────────────────────────────
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  res.json({ success: true, message: "Task deleted successfully" });
});

export {
  createTask,
  getTasks,
  getMyTasks,
  getTasksByFilter,
  getTask,
  updateTask,
  deleteTask,
};
