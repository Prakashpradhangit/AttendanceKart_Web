import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  UserPlus,
  Users,
  TrendingUp,
  Clock,
  X,
  Camera,
  User,
  Send,
  Upload,
  AlertCircle,
  FileText,
  CheckCircle2,
  Plus,
  Info,
  Megaphone,
} from "lucide-react";
import { useAlert } from '../context/AlertContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const generateMonthData = () => {
  return Array.from({ length: 31 }, (_, i) => {
    const date = i + 1;
    // Generate some mock data
    const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(date);
    const hours = isWeekend
      ? Math.random() > 0.8
        ? 4
        : 0
      : (7 + Math.random() * 3).toFixed(1);

    return {
      date: date,
      hours: parseFloat(hours),
      checkIn: hours > 0 ? "09:15 AM" : "---",
      checkOut:
        hours > 0
          ? `${(9 + Math.floor(hours)) % 12 || 12}:${Math.floor(
              (hours % 1) * 60,
            )
              .toString()
              .padStart(2, "0")} PM`
          : "---",
    };
  });
};

const data = generateMonthData();

const EmployeeDashboard = () => {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [attendanceType, setAttendanceType] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState("May 2026");
  const [chartData, setChartData] = useState(data);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [leaveDuration, setLeaveDuration] = useState("Full Day");
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [workDuration, setWorkDuration] = useState("00:00:00");
  const [presentCount, setPresentCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  
  // Missed Clock Out states
  const [showMissedClockOutModal, setShowMissedClockOutModal] = useState(false);
  const [missedDate, setMissedDate] = useState("");
  const [missedCheckInTime, setMissedCheckInTime] = useState("");
  const [missedTime, setMissedTime] = useState("");
  const [missedNote, setMissedNote] = useState("");
  const [submittingMissed, setSubmittingMissed] = useState(false);
  const [missingClockOuts, setMissingClockOuts] = useState([]);

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/attendance/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecord(data);
        if (data) {
          setIsCheckedIn(!!data.checkInTime);
          setIsCheckedOut(!!data.checkOutTime);
        } else {
          setIsCheckedIn(false);
          setIsCheckedOut(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch today attendance:", err);
    }
  };

  const fetchMissingClockOuts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/attendance/missing-clock-outs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMissingClockOuts(data);
      }
    } catch (err) {
      console.error("Failed to fetch missing clock outs:", err);
    }
  };

  const fetchMonthlyAttendance = async (monthStr) => {
    try {
      const token = localStorage.getItem("token");
      // Map "May 2026" to "2026-05"
      const [monthName, year] = monthStr.split(" ");
      const monthMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };
      const monthVal = monthMap[monthName];
      const yearMonth = `${year}-${monthVal}`;

      const response = await fetch(
        `/api/attendance/monthly?month=${yearMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const attendanceList = await response.json();

        // Map backend list to chart data structure
        const daysInMonth = new Date(year, monthVal, 0).getDate();
        const newChartData = Array.from({ length: daysInMonth }, (_, i) => {
          const date = i + 1;
          const dateStr = `${yearMonth}-${String(date).padStart(2, "0")}`;
          const record = attendanceList.find(
            (r) => r.attendanceDate === dateStr,
          );

          if (record) {
            const parseTime = (timeStr) => {
              if (!timeStr) return "---";
              const date = new Date(timeStr);
              return date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            };

            return {
              date: date,
              hours: record.workHours
                ? parseFloat(record.workHours.replace(":", "."))
                : 0,
              checkIn: parseTime(record.checkInTime),
              checkOut: parseTime(record.checkOutTime),
            };
          }

          return {
            date: date,
            hours: 0,
            checkIn: "---",
            checkOut: "---",
          };
        });

        setChartData(newChartData);
        setPresentCount(attendanceList.length);
        fetchLeaveCount();
      }
    } catch (err) {
      console.error("Failed to fetch monthly attendance:", err);
    }
  };

  const fetchLeaveCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/leaves/count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch leave count:", err);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveType,
          duration: leaveDuration,
          fromDate,
          toDate: leaveDuration === 'Full Day' ? toDate : fromDate,
          reason,
          status: 'PENDING'
        }),
      });

      if (response.ok) {
        setShowLeaveModal(false);
        setShowSuccessPopup(true);
        fetchLeaveCount();
        setFromDate('');
        setToDate('');
        setReason('');
      } else {
        const error = await response.json();
        showAlert(error.error || "Failed to submit leave request", "error");
      }
    } catch (err) {
      console.error("Failed to submit leave:", err);
      showAlert("An error occurred", "error");
    }
  };

  const handleMissedClockOutSubmit = async (e) => {
    e.preventDefault();
    if (!missedDate || !missedCheckInTime || !missedTime) {
      showAlert("Date, Clock-In Time and Clock-Out Time are required.", "error");
      return;
    }
    setSubmittingMissed(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/attendance/clock-out-requests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: missedDate,
          checkInTime: missedCheckInTime,
          checkOutTime: missedTime,
          note: missedNote
        })
      });
      if (res.ok) {
        setShowMissedClockOutModal(false);
        showAlert("Missed clock-out request submitted successfully!", "success");
        setMissedDate("");
        setMissedCheckInTime("");
        setMissedTime("");
        setMissedNote("");
        fetchMissingClockOuts();
      } else {
        const errorData = await res.json();
        showAlert(errorData.error || "Failed to submit request", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("An error occurred while submitting request.", "error");
    } finally {
      setSubmittingMissed(false);
    }
  };

  const [settings, setSettings] = useState({ checkInTime: '09:00', gracePeriod: 15, checkOutTime: '18:00', holidays: [] });

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          checkInTime: data.defaultCheckInTime || '09:00',
          checkOutTime: data.defaultCheckOutTime || '18:00',
          gracePeriod: data.gracePeriod || 15,
          holidays: (() => {
            try {
              return data.declaredHolidays ? JSON.parse(data.declaredHolidays) : [];
            } catch (e) {
              return [];
            }
          })()
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  // Filter holidays for the current month
  const getCurrentMonthHolidays = () => {
    if (!settings.holidays) return [];
    const [monthName, year] = selectedMonth.split(" ");
    const monthMap = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
    };
    const targetMonth = monthMap[monthName] !== undefined ? monthMap[monthName] : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    return settings.holidays.filter(h => {
      if (!h.date) return false;
      const parts = h.date.split('-');
      if (parts.length !== 3) return false;
      const hYear = parseInt(parts[0], 10);
      const hMonth = parseInt(parts[1], 10) - 1; // 0-indexed
      return hMonth === targetMonth && hYear === targetYear;
    });
  };

  const currentMonthHolidays = getCurrentMonthHolidays();

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notices", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotices(data);

        // Toast alert logic inside Employee Dashboard
        if (data && data.length > 0) {
          let seenIds = [];
          try {
            const stored = localStorage.getItem('seenNoticeIds');
            seenIds = stored ? JSON.parse(stored) : [];
          } catch (e) {
            seenIds = [];
          }

          const unseenNotice = data.find(n => !seenIds.includes(n.id));
          if (unseenNotice) {
            setActiveNotification(unseenNotice);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    }
  };

  const acknowledgeNotice = (id) => {
    try {
      const stored = localStorage.getItem('seenNoticeIds');
      const seenIds = stored ? JSON.parse(stored) : [];
      if (!seenIds.includes(id)) {
        seenIds.push(id);
        localStorage.setItem('seenNoticeIds', JSON.stringify(seenIds));
      }
    } catch (e) {
      console.error(e);
    }
    setActiveNotification(null);
  };

  useEffect(() => {
    fetchTodayAttendance();
    fetchMonthlyAttendance(selectedMonth);
    fetchSettings();
    fetchNotices();
    fetchMissingClockOuts();
  }, [selectedMonth]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchNotices();
    }, 8000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Update work duration if checked in and not checked out
      if (attendanceRecord?.checkInTime && !attendanceRecord?.checkOutTime) {
        const checkIn = new Date(attendanceRecord.checkInTime);
        const now = new Date();
        const diff = Math.floor((now - checkIn) / 1000);

        const h = Math.floor(diff / 3600)
          .toString()
          .padStart(2, "0");
        const m = Math.floor((diff % 3600) / 60)
          .toString()
          .padStart(2, "0");
        const s = Math.floor(diff % 60)
          .toString()
          .padStart(2, "0");

        setWorkDuration(`${h}:${m}:${s}`);
      } else if (attendanceRecord?.workHours) {
        setWorkDuration(attendanceRecord.workHours + ":00");
      } else {
        setWorkDuration("00:00:00");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attendanceRecord]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleAttendanceClick = (type) => {
    setAttendanceType(type);
    setShowPopup(true);
  };

  const handleCapture = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        attendanceType === "Check In"
          ? "/api/attendance/clock-in"
          : "/api/attendance/clock-out";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecord(data);
        if (attendanceType === "Check In") setIsCheckedIn(true);
        if (attendanceType === "Check Out") {
          setIsCheckedOut(true);
          if (data.earlyCheckOut) {
            showAlert("Warning: Early check-out detected. You have not completed your shift as set by the Admin.", "Early Check-Out Alert", "error");
          } else {
            showAlert(`Attendance ${attendanceType} captured successfully!`, "Success", "success");
          }
        } else {
          showAlert(`Attendance ${attendanceType} captured successfully!`, "Success", "success");
        }
        setShowPopup(false);

        // Refetch to sync everything
        fetchTodayAttendance();
        fetchMonthlyAttendance(selectedMonth);
        fetchMissingClockOuts();
      } else {
        const errorData = await response.json();
        showAlert(errorData.error || `Failed to ${attendanceType}`, "error");
      }
    } catch (err) {
      console.error(`Failed to capture ${attendanceType}:`, err);
      showAlert("An error occurred. Please try again.", "error");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-6">
        {/* Missing Clock-Out Alerts Banner */}
        {missingClockOuts && missingClockOuts.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-900 uppercase tracking-wider">Missing Clock-Out Alerts</h4>
                <p className="text-xs text-rose-700 font-semibold mt-0.5">
                  You missed clocking out on the following days. Please apply for regularization:
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {missingClockOuts.map((missed) => (
                <button
                  key={missed.id}
                  onClick={() => {
                    setMissedDate(missed.attendanceDate);
                    let formattedTime = "";
                    if (missed.checkInTime) {
                      try {
                        if (missed.checkInTime.includes("T")) {
                          formattedTime = missed.checkInTime.split("T")[1].substring(0, 5);
                        } else {
                          formattedTime = missed.checkInTime.substring(0, 5);
                        }
                      } catch (e) {
                        formattedTime = "";
                      }
                    }
                    setMissedCheckInTime(formattedTime);
                    setShowMissedClockOutModal(true);
                  }}
                  className="px-4 py-2 bg-white hover:bg-rose-100 border border-rose-150 hover:border-rose-300 text-rose-700 hover:text-rose-800 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                >
                  {missed.attendanceDate} (Apply)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Early Check-Out Warning Banner */}
        {attendanceRecord && attendanceRecord.checkOutTime && attendanceRecord.earlyCheckOut && (
          <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 shadow-sm flex items-center gap-4 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider">Early Check-Out Alert</h4>
              <p className="text-xs text-amber-700 font-semibold mt-0.5">
                You checked out early today before completing your full shift ({settings.checkInTime} - {settings.checkOutTime}).
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}

        {/* Stats Row - Updated with Total Present, Shift and Leave */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/40 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-[10px] font-black text-[#22C55E]/60 uppercase tracking-widest mb-1">
                Total Present
              </p>
              <h3 className="text-2xl font-black text-[#22C55E]">{presentCount}</h3>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-[#22C55E]">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/40 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="flex-1">
              <p className="text-[10px] font-black text-[#2563EB]/60 uppercase tracking-widest mb-1">
                Shift Status
              </p>
              <h3 className="text-xl font-black text-[#2563EB]">
                {isCheckedIn && !isCheckedOut ? "On Duty" : "Off Duty"}
              </h3>
            </div>
            <div className="flex-1 border-l border-gray-100 pl-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Expected Shift
              </p>
              <h3 className="text-[13px] font-black text-gray-700">
                {settings.checkInTime} - {settings.checkOutTime}
              </h3>
            </div>
            <div
              className={`w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-[#2563EB] ml-2`}
            >
              <User size={20} />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/40 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-[10px] font-black text-[#F97316]/60 uppercase tracking-widest mb-1">
                Leave Taken
              </p>
              <h3 className="text-2xl font-black text-[#F97316]">{leaveCount}</h3>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-[#F97316]">
              <Calendar size={24} />
            </div>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Insights Chart (7 Columns) */}
          <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-[40px] p-8 shadow-sm border border-white/40 flex flex-col">
             <div className="mb-6 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Attendance Trends</p>
                   <div className="flex items-end gap-3">
                      <h3 className="text-3xl font-black text-gray-900">92%</h3>
                      <span className="text-sm font-black text-[#22C55E] flex items-center gap-1 mb-1">
                         +4% <TrendingUp size={16} />
                      </span>
                   </div>
                </div>
                
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white/40 border border-white/20 rounded-2xl text-[10px] font-black text-gray-500 px-4 py-2.5 outline-none cursor-pointer hover:bg-white/60 hover:shadow-sm transition-all uppercase tracking-widest"
                >
                  <option value="January 2026">January 2026</option>
                  <option value="February 2026">February 2026</option>
                  <option value="March 2026">March 2026</option>
                  <option value="April 2026">April 2026</option>
                  <option value="May 2026">May 2026</option>
                  <option value="June 2026">June 2026</option>
                </select>
             </div>

             <div className="flex-1 min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                     <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#9CA3AF', fontSize: 8, fontWeight: 800}} 
                       dy={10}
                       interval={0} // Show all dates if possible, or adjust to 1
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 800}}
                       domain={[0, 12]}
                       ticks={[0, 2, 4, 6, 8, 10, 12]}
                     />
                     <Tooltip 
                       cursor={{fill: '#F8FAFC'}}
                       content={({ active, payload }) => {
                         if (active && payload && payload.length) {
                           const item = payload[0].payload;
                           return (
                             <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-50 animate-in fade-in zoom-in duration-200">
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Day {item.date}</p>
                               <div className="space-y-1.5">
                                 <div className="flex justify-between gap-4">
                                   <span className="text-xs font-bold text-gray-400">Check In:</span>
                                   <span className="text-xs font-black text-gray-900">{item.checkIn}</span>
                                 </div>
                                 <div className="flex justify-between gap-4">
                                   <span className="text-xs font-bold text-gray-400">Check Out:</span>
                                   <span className="text-xs font-black text-gray-900">{item.checkOut}</span>
                                 </div>
                                 <div className="pt-1.5 border-t border-gray-50 flex justify-between gap-4">
                                   <span className="text-xs font-bold text-[#8B5CF6]">Total:</span>
                                   <span className="text-xs font-black text-[#8B5CF6]">{item.hours} hrs</span>
                                 </div>
                               </div>
                             </div>
                           );
                         }
                         return null;
                       }}
                     />
                      <Bar 
                        dataKey="hours" 
                        radius={[4, 4, 4, 4]} 
                        barSize={8}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.hours > 0 ? '#22C55E' : '#F1F5F9'} 
                          />
                        ))}
                      </Bar>
                   </BarChart>
                 </ResponsiveContainer>
             </div>
          </div>

          {/* Quick Actions (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
               <div className="flex-1 flex flex-col gap-4">
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleAttendanceClick('Check In')}
                      className={`flex-1 p-4 rounded-[24px] flex flex-col items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 group ${
                        isCheckedIn 
                          ? 'bg-[#22C55E] text-white shadow-xl shadow-green-100' 
                          : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-lg'
                      }`}
                    >
                      <div className={`p-2 rounded-[14px] transition-all ${
                        isCheckedIn ? 'bg-white/20' : 'bg-white/40 text-gray-400 group-hover:bg-green-50 group-hover:text-green-500'
                      }`}>
                        <Clock size={20} />
                      </div>
                      <div className="text-center">
                        <p className={`text-[8px] font-black uppercase tracking-widest mb-0 ${
                          isCheckedIn ? 'text-white/60' : 'text-gray-400'
                        }`}>Start Day</p>
                        <span className="text-sm font-black tracking-tight">Check In</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleAttendanceClick('Check Out')}
                      className={`flex-1 p-4 rounded-[24px] flex flex-col items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 group ${
                        isCheckedOut 
                          ? 'bg-[#EF4444] text-white shadow-xl shadow-red-100' 
                          : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-lg'
                      }`}
                    >
                      <div className={`p-2 rounded-[14px] transition-all ${
                        isCheckedOut ? 'bg-white/20' : 'bg-white/40 text-gray-400 group-hover:bg-red-50 group-hover:text-red-500'
                      }`}>
                        <Clock size={20} />
                      </div>
                      <div className="text-center">
                        <p className={`text-[8px] font-black uppercase tracking-widest mb-0 ${
                          isCheckedOut ? 'text-white/60' : 'text-gray-400'
                        }`}>End Day</p>
                        <span className="text-sm font-black tracking-tight">Check Out</span>
                      </div>
                    </button>
                 </div>
                 
                 <div className="flex justify-center -mt-2">
                   <button 
                     onClick={() => setShowMissedClockOutModal(true)}
                     className="text-[10px] font-black text-[#8B5CF6] hover:text-purple-700 uppercase tracking-widest hover:underline transition-all flex items-center gap-1"
                   >
                     <Clock size={12} />
                     Missed a clock-out? Request entry
                   </button>
                 </div>
                 
                 {/* Active Timer Display moved here */}
                  <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/40 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                    <div>
                      <p className="text-[10px] font-black text-[#2563EB]/60 uppercase tracking-widest mb-1">
                        {isCheckedIn && !isCheckedOut ? "Active Time Counter" : "Total Work Duration"}
                      </p>
                      <h3 className="text-3xl font-black text-[#2563EB] tracking-tighter">
                        {workDuration}
                      </h3>
                    </div>
                    <div
                      className={`w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2563EB] ${isCheckedIn && !isCheckedOut ? "animate-pulse" : ""}`}
                    >
                      <Clock size={28} />
                    </div>
                  </div>

                  {/* Current Month Holidays */}
                  <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/40 shadow-sm flex flex-col gap-4 group hover:shadow-lg transition-all mt-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-[#8B5CF6]" />
                        <h4 className="text-sm font-black text-gray-800 tracking-tight">Holidays in {selectedMonth}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 bg-purple-50 text-[#8B5CF6] rounded-full font-bold text-[9px] uppercase">
                        {currentMonthHolidays.length} declared
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {currentMonthHolidays.map((holiday, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-purple-50/20 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#8B5CF6]">
                              <Calendar size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{holiday.name}</p>
                              <p className="text-[10px] text-gray-400 font-semibold">
                                {(() => {
                                  const parts = holiday.date.split('-');
                                  if (parts.length !== 3) return holiday.date;
                                  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', weekday: 'short' });
                                })()}
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Holiday</span>
                        </div>
                      ))}

                      {currentMonthHolidays.length === 0 && (
                        <p className="text-xs text-gray-400 font-medium text-center py-4">No holidays declared for {selectedMonth}</p>
                      )}
                    </div>
                  </div>

                 
               </div>

             <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => navigate("/employee/leaves")}
                  className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] flex flex-col items-start gap-4 text-gray-600 border border-white/40 shadow-sm hover:shadow-lg transition-all group w-full text-left"
                >
                  <div className="p-3 bg-white/40 rounded-[18px] text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                     <UserPlus size={24} />
                  </div>
                  <span className="text-sm font-black tracking-tight">Apply Leave</span>
                </button>

                <button className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] flex flex-col items-start gap-4 text-gray-600 border border-white/40 shadow-sm hover:shadow-lg transition-all group">
                  <div className="p-3 bg-white/40 rounded-[18px] text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                     <Users size={24} />
                  </div>
                  <span className="text-sm font-black tracking-tight">Meetings</span>
                </button>
             </div>
          </div>
        </div>

        {/* Dynamic Notice Board Section */}
        {notices.length > 0 && (
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 border border-white/40 shadow-sm flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center justify-between border-b border-gray-100/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Megaphone size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">Notice Board</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Stay updated with the latest organization announcements</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-black text-[10px] uppercase tracking-wider">
                {notices.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices.slice(0, 3).map((notice) => {
                const isUrgent = notice.category === 'Urgent';
                const isHoliday = notice.category === 'Holiday';
                const isEvent = notice.category === 'Event';
                let pillClass = 'bg-teal-50 text-teal-600 border-teal-100';
                let accentClass = 'border-l-teal-500';
                if (isUrgent) {
                  pillClass = 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse';
                  accentClass = 'border-l-rose-500';
                } else if (isHoliday) {
                  pillClass = 'bg-violet-50 text-violet-600 border-violet-100';
                  accentClass = 'border-l-violet-500';
                } else if (isEvent) {
                  pillClass = 'bg-blue-50 text-blue-600 border-blue-100';
                  accentClass = 'border-l-blue-500';
                }

                return (
                  <div
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className={`bg-white/90 rounded-[28px] p-6 border-l-4 ${accentClass} border-t border-r border-b border-gray-100/80 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${pillClass}`}>
                          {notice.category}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {(() => {
                            try {
                              const date = new Date(notice.createdAt);
                              return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                            } catch (e) {
                              return '';
                            }
                          })()}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-800 tracking-tight leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-1">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                        {notice.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-50/50 pt-3 mt-4">
                      <div className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[8px]">
                        {notice.createdBy ? notice.createdBy.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        {notice.createdBy || 'Admin'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">{attendanceType}</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Please authenticate your face to proceed</p>
              </div>

              {/* Face Auth Simulation UI */}
              <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#22C55E]/10 flex items-center justify-center">
                  <div className="w-[90%] h-[90%] rounded-full border border-[#22C55E]/30" />
                </div>
                <div className="w-48 h-48 rounded-full bg-[#F1F5F9] flex items-center justify-center border-4 border-white shadow-inner">
                  <User size={80} className="text-[#94A3B8]" />
                </div>
                {/* Scanning Animation Circle */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-4 border-l-4 border-transparent border-t-[#22C55E] border-l-[#22C55E]/30"
                />
              </div>

              <div className="mb-8">
                <p className="text-[#22C55E] font-black tracking-widest text-xs uppercase mb-2">Face Authentication</p>
                <div className="flex flex-col items-center">
                  <span className={`text-4xl font-black ${
                    attendanceType === 'Check In' && (() => {
                      const [bHour, bMin] = settings.checkInTime.split(':').map(Number);
                      const totalMins = bMin + Number(settings.gracePeriod);
                      const tHour = bHour + Math.floor(totalMins / 60);
                      const tMin = totalMins % 60;
                      return currentTime.getHours() > tHour || (currentTime.getHours() === tHour && currentTime.getMinutes() > tMin);
                    })()
                      ? 'text-red-500' 
                      : 'text-[#1E293B]'
                  }`}>
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-gray-400 text-sm font-bold mt-1">{formatDate(currentTime)}</span>
                </div>
              </div>

              <button
                onClick={handleCapture}
                className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Capture
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-20"
            >
              <X size={20} />
            </button>

            <div className="p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Plus size={20} className="text-[#0061E0]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Apply for Leave</h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Submit your request</p>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={handleLeaveSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Leave Type</label>
                      <select 
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#0061E0] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer appearance-none"
                      >
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Annual Leave">Annual Leave</option>
                        <option value="Half Day">Half Day</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Duration</label>
                      <select 
                        value={leaveDuration}
                        onChange={(e) => setLeaveDuration(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#0061E0] focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer appearance-none"
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="First Half">First Half</option>
                        <option value="Second Half">Second Half</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                        {leaveDuration === 'Full Day' ? 'From Date' : 'Date'}
                      </label>
                      <input 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#0061E0] transition-all" 
                        required
                      />
                    </div>
                    {leaveDuration === "Full Day" ? (
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">To Date</label>
                        <input 
                          type="date" 
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#0061E0] transition-all" 
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Time</label>
                        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                          <Clock size={16} className="text-blue-400" />
                          <input type="time" className="bg-transparent border-none outline-none text-xs font-semibold w-full" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                      Documents (Optional)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl p-6 flex flex-col items-center gap-2 group-hover:border-blue-400/50 transition-all">
                        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Upload
                            size={18}
                            className="text-gray-400 group-hover:text-blue-400"
                          />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                          Upload document
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                      Reason
                    </label>
                    <textarea
                      placeholder="Tell us why..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-semibold text-gray-700 outline-none focus:border-[#0061E0] focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[90px] resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0061E0] hover:bg-[#0052cc] text-white py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    <Send size={18} />
                    Submit Request
                  </button>
                </form>

                <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
                  <AlertCircle size={18} className="text-yellow-500 shrink-0" />
                  <p className="text-[10px] font-medium text-white/60 leading-relaxed">
                    Submit at least 2 days in advance. Ensure all documents are
                    clear.
                  </p>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full -ml-24 -mb-24 blur-[80px]"></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-[48px] shadow-2xl w-full max-w-[360px] overflow-hidden p-10 flex flex-col items-center text-center relative border border-white/20"
          >
            {/* Animated Icon Container */}
            <div className="relative mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center relative"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Send
                    size={44}
                    className="text-[#0052CC] -rotate-12 translate-x-1"
                  />
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 size={16} className="text-white" />
                </motion.div>
              </motion.div>

              {/* Decorative Pulse Rings */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping -z-10 scale-150 opacity-0 group-hover:opacity-100"></div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                Request sent to admin
              </h2>
              <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed px-4">
                Your request for the leave{" "}
                <span className="text-[#0052CC] font-bold">({leaveType})</span>{" "}
                has been sent successfully.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-blue-50/80 border border-blue-100 rounded-3xl p-5 mb-10 flex items-start gap-4 text-left"
            >
              <div className="w-7 h-7 bg-[#0061E0] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                <Info size={14} className="text-white" />
              </div>
              <p className="text-[11px] font-bold text-gray-600 leading-normal">
                You will be notified once the admin approves your request. Check
                your inbox for updates.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#0061E0] to-[#0052cc] text-white py-5 rounded-2xl font-semibold text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all"
              onClick={() => setShowSuccessPopup(false)}
            >
              OK, Got it
            </motion.button>

            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0061E0] via-blue-400 to-[#0061E0]"></div>
          </motion.div>
        </div>
      )}

      {/* Notice Detail Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotice(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden z-10"
            >
              {/* Decorative background gradient */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    selectedNotice.category === 'Urgent'
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : selectedNotice.category === 'Holiday'
                      ? 'bg-violet-50 text-violet-600 border-violet-100'
                      : selectedNotice.category === 'Event'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-teal-50 text-teal-600 border-teal-100'
                  }`}>
                    {selectedNotice.category}
                  </span>
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
                    {selectedNotice.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedNotice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      By {selectedNotice.createdBy || 'Admin'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-slate-600 text-sm font-medium leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                  {selectedNotice.content}
                </div>

                <button 
                  onClick={() => setSelectedNotice(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 mt-2"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Notification Toast inside Employee Dashboard */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[999] max-w-sm w-full bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100 p-5 shadow-2xl shadow-primary/20 flex gap-4 items-start relative overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <Megaphone size={20} className="animate-bounce" />
            </div>
            
            <div className="flex-1 space-y-1 text-left">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                  activeNotification.category === 'Urgent'
                    ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                    : activeNotification.category === 'Holiday'
                    ? 'bg-violet-50 text-violet-600 border-violet-100'
                    : activeNotification.category === 'Event'
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : 'bg-teal-50 text-teal-600 border-teal-100'
                }`}>
                  {activeNotification.category}
                </span>
                <button
                  onClick={() => acknowledgeNotice(activeNotification.id)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <h4 className="text-xs font-extrabold text-slate-800 tracking-tight leading-snug line-clamp-1">
                {activeNotification.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2 pb-2">
                {activeNotification.content}
              </p>
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setSelectedNotice(activeNotification);
                    acknowledgeNotice(activeNotification.id);
                  }}
                  className="px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer"
                >
                  View Detail
                </button>
                <button
                  onClick={() => acknowledgeNotice(activeNotification.id)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missed Clock Out Modal */}
      <AnimatePresence>
        {showMissedClockOutModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMissedClockOutModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden z-10 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-snug flex items-center gap-2">
                  <Clock size={20} className="text-[#8B5CF6]" />
                  Request Clock-Out
                </h3>
                <button
                  onClick={() => setShowMissedClockOutModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleMissedClockOutSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Missed</label>
                  <input 
                    type="date"
                    value={missedDate}
                    onChange={(e) => setMissedDate(e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold transition-all text-sm"
                  />
                </div>
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clock-In Time</label>
                  <input 
                    type="time"
                    value={missedCheckInTime}
                    onChange={(e) => setMissedCheckInTime(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clock-Out Time</label>
                  <input 
                    type="time"
                    value={missedTime}
                    onChange={(e) => setMissedTime(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason / Note</label>
                  <textarea 
                    value={missedNote}
                    onChange={(e) => setMissedNote(e.target.value)}
                    placeholder="Forgot to clock out before leaving..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold transition-all text-sm min-h-[80px]"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={submittingMissed}
                  className="w-full py-3.5 bg-[#8B5CF6] text-white rounded-2xl font-semibold hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-purple-900/20 mt-4 disabled:opacity-50"
                >
                  {submittingMissed ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmployeeDashboard;
