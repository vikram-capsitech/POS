function isToday(dateString) {
  const today = new Date().toISOString().split('T')[0];
  const date = new Date(dateString).toISOString().split('T')[0];
  return today === date;
}

export const getTodayTaskStats =(tasks) => {
  const todayTasks = tasks?.filter(task => isToday(task?.createdAt));
  return getTaskStats(todayTasks);
}

export const getTaskStats =(tasks)  => {
  const total = tasks?.length;
  const completed = tasks?.filter(task => task?.status === "Completed")?.length;
  const inProgress =tasks?.filter(task =>task?.status ==="In Progress")?.length;
  const pending =tasks?.filter(task =>task?.status ==="Pending")?.length;
  const uncompleted = total - completed;
  const none =
  completed === 0 &&
 inProgress === 0 &&
  pending === 0 ;

  return { total, completed, uncompleted,inProgress,pending ,none};
}
