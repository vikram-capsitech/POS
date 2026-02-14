export const  analyzeAttendance =(attendanceData) => {
    if (!attendanceData || attendanceData.length === 0) {
        return {
            totalEmployees: 0,
            avgCheckIn: null,
            status: "Absent"
        };
    }

    const targetTime = new Date();
    targetTime.setHours(9, 0, 0, 0); // 9:00 AM target

    let totalMinutes = 0;
    attendanceData.forEach(record => {
        if (record.checkIn) {
            const checkInTime = new Date(record.checkIn);
            const diffMinutes = (checkInTime - targetTime) / (1000 * 60);
            totalMinutes += diffMinutes;
        }
    });

    const avgMinutes = totalMinutes / attendanceData.length;
    const avgCheckInTime = new Date(targetTime.getTime() + avgMinutes * 60 * 1000);

    let status = "On Time";
    if (avgMinutes > 10) status = "Mostly Late";  // more than 10 min late
    else if (avgMinutes < -10) status = "Mostly Early"; // more than 10 min early

    return {
        totalEmployees: attendanceData.length,
        avgCheckIn: avgCheckInTime.toISOString(),
        avgMinutesDifference: avgMinutes,
        status
    };
}
