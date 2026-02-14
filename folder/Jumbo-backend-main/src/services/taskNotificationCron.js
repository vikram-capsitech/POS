const cron = require("node-cron");
const dayjs = require("dayjs");
const Task = require("../models/Task");
const { sendNotification } = require("./notificationService");

cron.schedule("* * * * *", async () => {
  try {
    const now = dayjs();
    const fiveMinutesLater = now.add(5, "minute");

    const tasks = await Task.find({
      isNew: true,
      "deadline.startDate": {
        $gte: now.toDate(),
        $lte: fiveMinutesLater.toDate(),
      },
    }).populate("assignTo");
    for (const task of tasks) {
      for (const employee of task.assignTo) {
        await sendNotification(
          employee._id,
          "info",
          "task",
          "Task Starting Soon ⏰",
          `Your task "${task.title}" will start in 5 minutes.`,
          {
            taskId: task._id.toString(),
            startDate: task.deadline.startDate,
          },
        );
      }

      task.isNew = false;
      await task.save();
    }
  } catch (error) {
    console.error("❌ Task notification cron error:", error);
  }
});
