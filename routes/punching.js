const express = require("express");
const router = express.Router();
const Punching = require("../models/punching");
const punching = require("../models/punching");
const Employee = require('../models/employee');







router.get("/punching/:mobileNo", async (req, res) => {
  try {
    const mobileNo = req.params.mobileNo;

    const results = await punching.find({ mobileNo: mobileNo });

    res.status(200).json({
      statusCode: 200,
      message: "Search results",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

//   try {
//     const mobileNo = req.params.mobileNo;

//     // Find the punching record for the given mobileNo
//     const punchingRecord = await Punching.findOne({ mobileNo });
//     console.log("punchingRecord", punchingRecord);

//     if (!punchingRecord) {
//       return res.status(404).json({ status: "error", message: "Punching record not found." });
//     }

//     // Extract the punching and punchout times from the record
//     const { punchingdate, punchingtime, punchoutdate, punchOuttime,status } = punchingRecord;
//     console.log("punchingRecord", punchingRecord);

//     // Create Date objects from the timestamps
//     const punchingTime = new Date(`${punchingdate}T${punchingtime}`);
//     const punchOutTime = new Date(`${punchoutdate}T${punchOuttime}`);
//     console.log("punchOutTime", punchOutTime);

//     // Calculate the elapsed time in milliseconds
//     const elapsedTimeMilliseconds = punchOutTime - punchingTime;

//     // Calculate hours, minutes, and seconds from milliseconds
//     const hours = Math.floor(elapsedTimeMilliseconds / (1000 * 60 * 60));
//     const minutes = Math.floor((elapsedTimeMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((elapsedTimeMilliseconds % (1000 * 60)) / 1000);

//     res.status(200).json({
//       status: "success",
//       elapsedTime: {
//         hours,
//         minutes,
//         seconds,
//       },
//     });
//   } catch (error) {
//     // Handle any errors that occur during the process
//     res.status(500).json({
//       status: "error",
//       statusCode: 500,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// });

router.post("/attandance", async (req, res) => {
  try {
    
    var data = await punching.create(req.body);
    console.log("data kdslda",data)
    res.json({
      statusCode: 200,
      data: data,
      message: "Add  Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//get api for




//get practice
router.get("/attandance/:mobileNumber/:fromDate/:toDate", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;
    const fromDate = new Date(req.params.fromDate);
    const toDate = new Date(req.params.toDate);
    console.log("mobileNumber", mobileNumber);
    // Use Mongoose to find "Punch in" and "Punch out" records within the date range
    const punchInRecords = await punching.find({
      mobileNo: mobileNumber,
      attendandanceDate: {
        $gte: fromDate,
        $lte: toDate,
      },
      status: "Punch in",
    });
    console.log("punchInRecords", punchInRecords);
    const punchOutRecords = await punching.find({
      mobileNo: mobileNumber,
      attendandanceDate: {
        $gte: fromDate,
        $lte: toDate,
      },
      status: "Punch out",
    });
    console.log("punchOutRecords", punchOutRecords);
    // Create an object to store total times for each day
    const totalTimes = {};
    // Iterate through "Punch in" records and calculate total times
    for (const punchIn of punchInRecords) {
      const punchOut = punchOutRecords.find(
        (punchOut) =>
          punchOut.mobileNo === punchIn.mobileNo &&
          punchOut.attendandanceDate.toISOString() === punchIn.attendandanceDate.toISOString()
      );
      if (punchOut) {
        const punchInTime = new Date(punchIn.attendandanceDate);
        punchInTime.setHours(...punchIn.attendandanceTime.split(':'));
        const punchOutTime = new Date(punchOut.attendandanceDate);
        punchOutTime.setHours(...punchOut.attendandanceTime.split(':'));
        // Calculate the time difference for the day in milliseconds
        const timeDifference = punchOutTime - punchInTime;
        // Add the time difference to the corresponding day's total
        if (totalTimes[punchIn.attendandanceDate.toISOString()]) {
          totalTimes[punchIn.attendandanceDate.toISOString()] += timeDifference;
        } else {
          totalTimes[punchIn.attendandanceDate.toISOString()] = timeDifference;
        }
      }
    }
    // Convert total times to hours, minutes, and seconds
    const formattedTotalTimes = {};
    let totalMillisecondsSum = 0;
    for (const [date, timeDifference] of Object.entries(totalTimes)) {
      const totalMilliseconds = timeDifference;
      totalMillisecondsSum += totalMilliseconds;
      const totalSeconds = Math.floor(totalMilliseconds / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      formattedTotalTimes[date] = `${totalHours}:${totalMinutes % 60}:${totalSeconds % 60}`;
    }
    // Calculate the sum of all total times
    const totalSecondsSum = Math.floor(totalMillisecondsSum / 1000);
    const totalMinutesSum = Math.floor(totalSecondsSum / 60);
    const totalHoursSum = Math.floor(totalMinutesSum / 60);
    const formattedTotalSum = `${totalHoursSum}:${totalMinutesSum % 60}:${totalSecondsSum % 60}`;
    res.status(200).json({
      statusCode: 200,
      message: "Total times between selected dates",
      data: {
        dailytimediffrence: formattedTotalTimes,
        totaltime: formattedTotalSum,
      },
    });
  } catch (error) {
    console.error("Error:", error); // Log the error
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});



router.get("/leavestats/:empid", async (req, res) => {
  try {
    // Extract the empid from the request parameters
    const { empid } = req.params;
    // Count the number of leave requests for each leave type
    const privilegeLeaveCount = await leave.countDocuments({
      empid,
      leavetype: "Privileged leave",
    });
    const sickLeaveCount = await leave.countDocuments({
      empid,
      leavetype: "Sick Leave",
    });
    const casualLeaveCount = await leave.countDocuments({
      empid,
      leavetype: "casual",
    });
    // Return the leave statistics in the response
    res.status(200).json({
      statusCode: 200,
      privilegeLeaveCount,
      sickLeaveCount,
      casualLeaveCount,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});


router.post("/attandance", async (req, res) => {
  try {
    var data = await punching.create(req.body);
    console.log("data kdslda",data)
    res.json({
      statusCode: 200,
      data: data,
      message: "Add  Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/attandance/:mobileNumber/:fromDate/:toDate", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;
    const fromDate = new Date(req.params.fromDate);
    const toDate = new Date(req.params.toDate);
    // Find all "Punch in" and "Punch out" records for the mobile number and date range
    const records = await Punching.find({
      mobileNo: mobileNumber,
      attendandanceDate: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).sort({ attendandanceDate: 1 }); // Sort records by date in ascending order
    // Calculate daily time differences
    const dailyTimeDifferences = [];
    let currentDay = null;
    let punchInTime = null;
    let totalHours = 0;
    let totalMinutes = 0;
    let totalSeconds = 0;
    const getTimeDifference = (fromtime, totime) => {
      const punchInTimeParts = fromtime.split(":");
      const punchOutTimeParts = totime.split(":");
      const punchInHours = parseInt(punchInTimeParts[0]);
      const punchInMinutes = parseInt(punchInTimeParts[1]);
      const punchInSeconds = parseInt(punchInTimeParts[2]);
      const punchOutHours = parseInt(punchOutTimeParts[0]);
      const punchOutMinutes = parseInt(punchOutTimeParts[1]);
      const punchOutSeconds = parseInt(punchOutTimeParts[2]);
      // Calculate hours, minutes, and seconds
      const hours = punchOutHours - punchInHours;
      const minutes = punchOutMinutes - punchInMinutes;
      const seconds = punchOutSeconds - punchInSeconds;
      // Ensure minutes and seconds are positive
      if (seconds < 0) {
        minutes -= 1;
        seconds += 60;
      }
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      console.log("getTimeDiff", `${hours}:${minutes}:${seconds}`);
      return { hours, minutes, seconds };
    };
    // Calculate the number of days in the date range
    const millisecondsInADay = 1000 * 60 * 60 * 24; // Number of milliseconds in a day
    const timeDifferenceInMilliseconds = toDate - fromDate;
    const numberOfDays = Math.floor(timeDifferenceInMilliseconds / millisecondsInADay) + 1;
    for (var i = 0; i < records.length; i += 2) {
      const recordDate = records[i].attendandanceDate;
      const recordTime = records[i].attendandanceTime;
      const status = records[i].status;
      if (
        status === "Punch in" &&
        records[i + 1].status === "Punch out" &&
        records[i + 1].attendandanceDate.toString().slice(0, 10) ===
          recordDate.toString().slice(0, 10)
      ) {
        const timeDifference = getTimeDifference(
          recordTime,
          records[i + 1].attendandanceTime
        );
        totalHours += timeDifference.hours;
        totalMinutes += timeDifference.minutes;
        totalSeconds += timeDifference.seconds;
        dailyTimeDifferences.push({
          date: recordDate,
          difference: `${timeDifference.hours} hours and ${timeDifference.minutes} minutes`,
        });
      }
    }
    if (totalSeconds >= 60) {
      totalMinutes += Math.floor(totalSeconds / 60);
      totalSeconds = totalSeconds % 60;
    }
    if (totalMinutes >= 60) {
      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes = totalMinutes % 60;
    }
    const formattedTotalTimeDifference = `${totalHours} hours and ${totalMinutes} minutes`;
    console.log("totalHour", totalHours);
    console.log("totalMinutes", totalMinutes);
    console.log("totalSeconds", totalSeconds);
    res.status(200).json({
      statusCode: 200,
      message: "Daily Time Differences",
      data: {
        dailyTimeDifferences: dailyTimeDifferences,
        total: formattedTotalTimeDifference,
        numberOfDays: numberOfDays, // Include the number of days in the response
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});





// Helper function to calculate time difference

router.get('/matching-mobiles/:date', async (req, res) => {
  try {
    const selectedDate = new Date(req.params.date);

    // Find mobile numbers and names in the 'employee' collection
    const employees = await Employee.find({}, 'mobileNo name');

    // Find mobile numbers in the 'punching' collection for the selected date
    const punchMobiles = await Punching.distinct('mobileNo', {
      attendandanceDate: selectedDate,
    });

    // Find mobile numbers that are present in both collections
    const matchingEmployees = employees.filter((employee) => punchMobiles.includes(employee.mobileNo));
    const mismatchedEmployees = employees.filter((employee) => !punchMobiles.includes(employee.mobileNo));

    const presentData = matchingEmployees.map((employee) => ({
      name: employee.name,
      mobileNo: employee.mobileNo,
    }));

    const absentData = mismatchedEmployees.map((employee) => ({
      name: employee.name,
      mobileNo: employee.mobileNo,
    }));

    // Extract punch in and punch out times for present employees
    const punchData = await Punching.find({
      attendandanceDate: selectedDate,
      mobileNo: { $in: matchingEmployees.map((employee) => employee.mobileNo) },
    });

    const presentWithAttendance = matchingEmployees.map((employee) => {
      const employeePunchData = punchData.find((punch) => punch.mobileNo === employee.mobileNo);
      if (employeePunchData) {
        return {
          name: employee.name,
          mobileNo: employee.mobileNo,
          punchIn: employeePunchData.attendandanceTime,
          punchOut: punchData.find((punch) => punch.mobileNo === employee.mobileNo && punch.status === 'Punch Out')
            ?.attendandanceTime,
        };
      }
      return null;
    });

    const presentWithPunchTimes = presentWithAttendance.filter((employee) => employee !== null);

    const present = presentWithPunchTimes.length;
    const absent = absentData.length;

    res.status(200).json({
      statusCode: 200,
      message: `Mobile numbers, names, and attendance times present in both "employee" and "punching" collections for the date ${selectedDate.toISOString()}`,
      data: {
        present: {
          count: present,
          employees: presentWithPunchTimes,
        },
        absent: {
          count: absent,
          employees: absentData,
        },
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: error.message,
    });
  }
});


router.get('/employee-punch-records/:mobileNo/:year/:month', async (req, res) => {
  try {
    const { mobileNo, year, month } = req.params;

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const currentDate = new Date();
    const lastDayOfMonth = new Date(year, month - 1, currentDate.getDate(), 23, 59, 59);

    const presentDays = await Punching.distinct('attendandanceDate', {
      mobileNo,
      attendandanceDate: { $gte: firstDayOfMonth, $lte: currentDate }, // Updated condition
      status: 'Punch In',
    });


    const totalDaysInMonth = currentDate.getDate(); // Use the current date
    const absentDays = totalDaysInMonth - presentDays.length;

    res.status(200).json({
      statusCode: 200,
      message: `Punch in records for ${mobileNo} in ${year}-${month}`,
      data: {
        presentDays: presentDays.length,
        absentDays: absentDays,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: error.message,
    });
  }
});







module.exports = router;




