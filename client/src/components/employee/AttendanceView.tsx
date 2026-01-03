import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { db, AttendanceRecord } from '../../services/database';
import { getTodayDDMMYYYY, parseDate, formatDate, getTodayISODate } from '../../utils/dateUtils';

interface AttendanceViewProps {
  userId: string;
}

// Helper function to format time from ISO string
const formatTime = (dateString: string | Date | undefined): string => {
  if (!dateString) return '--:--';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '--:--';
  }
};

export function AttendanceView({ userId }: AttendanceViewProps) {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    loadAttendance();
  }, [userId]);

  const loadAttendance = async () => {
    try {
      const records = await db.getAttendanceByUserId(userId);
      console.log('Raw records from server:', records);
      
      setAttendanceRecords(records.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()));

      // Check today's record - normalize the date comparison
      const today = getTodayDDMMYYYY();
      console.log('Looking for date match. Today (formatted):', today);
      
      const todayRec = records.find(r => {
        console.log('Comparing record date:', r.date, 'with today:', today, 'Match:', r.date === today);
        return r.date === today;
      });
      
      console.log('Today record found:', todayRec);
      setTodayRecord(todayRec || null);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    const today = getTodayDDMMYYYY();

    if (todayRecord) {
      // Already checked in, offer to check out instead
      if (!todayRecord.checkOutTime) {
        toast.info('Already checked in. Use Check Out button to check out.');
      } else {
        toast.error('Already checked in and checked out today');
      }
      return;
    }

    try {
      const now = new Date().toISOString();
      const todayISO = getTodayISODate();

      const newRecord = await db.createAttendance({
        employeeId: userId,
        date: todayISO,
        checkIn: now,
        status: 'present',
      });

      console.log('New attendance record created:', newRecord);

      // Immediately update local state with the new record
      setTodayRecord(newRecord);
      setAttendanceRecords(prev => [newRecord, ...prev]);

      toast.success('Checked in successfully! You can now check out.');
      
      // Also fetch from server to ensure consistency
      setTimeout(() => loadAttendance(), 500);
    } catch (error: any) {
      console.error('Error checking in:', error);
      
      // If it's a duplicate key error, try to load the existing record
      if (error.message.includes('Already checked in') || error.message.includes('duplicate')) {
        console.log('Duplicate check-in detected, loading existing record...');
        setTimeout(() => loadAttendance(), 300);
        toast.info('You already checked in today. Loading your record...');
      } else {
        toast.error(error.message || 'Failed to check in');
      }
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) {
      toast.error('No check-in record found for today');
      return;
    }

    if (todayRecord.checkOutTime) {
      toast.error('Already checked out today');
      return;
    }

    try {
      const now = new Date().toISOString();
      
      console.log('Checking out with record ID:', todayRecord.id);
      
      const updatedRecord = await db.updateAttendance(todayRecord.id!, {
        checkOut: now,
      });

      if (updatedRecord) {
        setTodayRecord(updatedRecord);
        const updatedRecords = attendanceRecords.map(r => r.id === todayRecord.id ? updatedRecord : r);
        setAttendanceRecords(updatedRecords);
        toast.success('Checked out successfully!');
      } else {
        toast.error('Failed to check out. Please try again.');
      }
      
      // Refresh from server
      setTimeout(() => loadAttendance(), 500);
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast.error(error.message || 'Failed to check out');
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(formatDate(date));
    }
    return dates;
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      'half-day': 'bg-yellow-100 text-yellow-800',
      leave: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full ${styles[status]}`}>
        {status === 'half-day' ? 'Half Day' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const weekDates = view === 'weekly' ? getWeekDates() : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-gray-900">My Attendance</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-2 rounded-lg ${
              view === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-4 py-2 rounded-lg ${
              view === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {view === 'daily' && (
        <div className="space-y-6">
          {/* Check-in/Check-out Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-gray-900">Today's Attendance</h3>
                <p className="text-gray-600">{getTodayDDMMYYYY()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 mb-2">Check In</p>
                <p className="text-gray-900">
                  {formatTime(todayRecord?.checkIn)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-gray-600 mb-2">Check Out</p>
                <p className="text-gray-900">
                  {formatTime(todayRecord?.checkOut)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckIn}
                disabled={!!todayRecord}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!todayRecord || !!todayRecord?.checkOut}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <LogOutIcon className="w-5 h-5" />
                Check Out
              </button>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Recent Attendance</h3>
            <div className="space-y-3">
              {attendanceRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-900">{record.date}</p>
                    <p className="text-gray-600">
                      {record.checkIn && `In: ${record.checkIn}`}
                      {record.checkOut && ` | Out: ${record.checkOut}`}
                    </p>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))}
              {attendanceRecords.length === 0 && (
                <p className="text-center text-gray-500 py-8">No attendance records found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'weekly' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-gray-900">This Week's Attendance</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {weekDates.map((date) => {
              const record = attendanceRecords.find(r => r.date === date);
              const dateObj = parseDate(date);
              const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
              
              return (
                <div key={date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-20">
                      <p className="text-gray-900">{dayName}</p>
                      <p className="text-gray-600">{date}</p>
                    </div>
                    {record && (
                      <div className="flex items-center gap-4 text-gray-600">
                        {record.checkIn && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>In: {record.checkIn}</span>
                          </div>
                        )}
                        {record.checkOut && (
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>Out: {record.checkOut}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {record ? (
                    getStatusBadge(record.status)
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600">--</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
