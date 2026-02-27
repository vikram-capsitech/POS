const Task = require("../models/Task");
const { decodeToken } = require("../utils/decodeToken");
const { sendBulkNotification } = require("../services/notificationService");
const Employee = require("../models/Employee");

const createTask = async (req, res) => {
  try {
    const voiceNote = req.file?.path || null;
    const decodedId = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      // It was an employee ID (app request)
      restaurantID = employee.restaurantID;
    } else {
      // It was already a restaurantID (admin request)
      restaurantID = decodedId;
    }
    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }

    const task = await Task.create({
      ...req.body,
      restaurantID,
      voiceNote, // Save Cloudinary audio URL in your DB
    });


    // Send notification to assigned employee(s)
    if (task.assignTo) {
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
        `You have been assigned a new task: ${task.title}. Deadline: ${deadline}`,
        { taskId: task._id.toString(), priority: task.priority },
      );
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const getTasks = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(decodedId);
    let id;
    if (employee) {
      // It was an employee ID (app request)
      id = employee.restaurantID;
    } else {
      // It was already a restaurantID (admin request)
      id = decodedId;
    }
    const { page = 1, limit } = req.query;
    const query = { restaurantID: id };
    const tasks = await Task.find(query)
      .populate("assignTo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Task.countDocuments(query);
    const newTasksCount = await Task.countDocuments({ ...query, isNew: true });

    res.status(200).json({
      tasks,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      newTasksCount,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const getTasksforEmployees = async (req, res) => {
  try {
    const id = await decodeToken(req);
    // const id = req.params.id;
    const tasks = await Task.find({ assignTo: id })
      .populate("assignTo")
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const getTasksbyFilter = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      // It was an employee ID (app request)
      restaurantID = employee.restaurantID;
    } else {
      // It was already a restaurantID (admin request)
      restaurantID = decodedId;
    }
    const {
      page = 1,
      limit = 10,
      category,
      assignTo,
      priority,
      status,
    } = req.body;

    const query = { restaurantID };

    const orConditions = [];

    if (category && category.length) {
      orConditions.push({ category: { $in: category } });
    }

    if (assignTo && assignTo.length) {
      orConditions.push({ assignTo: { $in: assignTo } });
    }

    if (priority && priority.length) {
      orConditions.push({ priority: { $in: priority } });
    }

    if (status && status.length) {
      orConditions.push({ status: { $in: status } });
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    const tasks = await Task.find(query)
      .populate("assignTo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Task.countDocuments(query);

    res.status(200).json({
      tasks,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignTo")
      .populate("sop");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const updateTask = async (req, res) => {
  try {
    const oldTask = await Task.findById(req?.params?.id);

    // Handle timer logic based on status changes
    if (req.body.status) {
      // Starting task - set startTime
      if (req.body.status === "In Progress" && oldTask.status === "Pending") {
        req.body.startTime = new Date();
      }

      // Completing task - set endTime and calculate totalTimeSpent
      if (req.body.status === "Completed" && oldTask.status === "In Progress") {
        req.body.endTime = new Date();
        if (oldTask.startTime) {
          const timeSpentMs = new Date() - new Date(oldTask.startTime);
          req.body.totalTimeSpent = Math.floor(timeSpentMs / 1000); // Convert to seconds
        }
      }
      // if(req.body.status==="Completed"){
      //   req.body.isNew=true;
      // }
    }

    const task = await Task.findByIdAndUpdate(req?.params?.id, req.body, {
      new: true,
    }).populate("assignTo");

    if (!task) return res.status(404).json({ message: "Task not found" });
    //  SOCKET EVENT
    if ( task.status==="Completed") {
      const io = req.app.get("io");

      io.to(`ADMIN_${task.restaurantID}`).emit("TASK_EVENT", {
        event: "STATUS_CHANGED",
        taskId: task._id,
        status: task.status,
      });
    }

    // Send notification if status changed
    if (oldTask && req.body.status && oldTask.status !== req.body.status) {
      const assignees = Array.isArray(task.assignTo)
        ? task.assignTo.map((a) => a._id || a)
        : [task.assignTo._id || task.assignTo];

      let notificationTitle = "Task Status Updated";
      let notificationMessage = `Task "${task.title}" status changed to ${req.body.status}`;

      if (req.body.status === "In Progress") {
        notificationTitle = "Task Started";
        notificationMessage = `You have started the task: "${task.title}"`;
      } else if (req.body.status === "Completed") {
        notificationTitle = "Task Completed";
        notificationMessage = `Congratulations! You have completed the task: "${task.title}"`;
      }

      await sendBulkNotification(
        assignees,
        req.body.status === "Completed" ? "success" : "info",
        "task",
        notificationTitle,
        notificationMessage,
        { taskId: task._id.toString(), status: req.body.status },
      );
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(201).json({ message: "Task Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};



module.exports = {
  createTask,
  getTasks,
  getTask,
  getTasksforEmployees,
  getTasksbyFilter,
  updateTask,
  deleteTask,
};
