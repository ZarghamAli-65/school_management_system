"use client";

import { useEffect, useMemo, useState } from "react";
import { getStudents } from "@/lib/api/student.api";
import {
  getStudentAttendance,
  markStudentAttendance,
  StudentAttendanceStatus,
} from "@/lib/api/attendance.api";
import { getTeachers } from "@/lib/api/teacher.api";
import { getAuthToken } from "@/lib/api/client";

type Student = {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  classId?: number;
};

type AttendanceMap = Record<
  number,
  StudentAttendanceStatus | "NOT_MARKED"
>;

const STATUS_OPTIONS: StudentAttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LEAVE",
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getTokenPayload() {
  const token = getAuthToken();

  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const TeacherStudentAttendance = () => {
  const [classId, setClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});

  const [date, setDate] = useState(getToday());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTeacherClass = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = getTokenPayload();

      const teachersResponse = await getTeachers();

      const teachers = Array.isArray(teachersResponse)
        ? teachersResponse
        : teachersResponse?.data ?? [];

      const currentTeacher = teachers.find((teacher: any) => {
        if (payload?.sub && String(teacher.id) === String(payload.sub)) {
          return true;
        }

        if (
          payload?.email &&
          teacher.email?.toLowerCase() === payload.email.toLowerCase()
        ) {
          return true;
        }

        return false;
      });

      if (!currentTeacher) {
        throw new Error("Current teacher profile not found.");
      }

      const classes = currentTeacher.classes ?? [];

      if (!classes.length) {
        setClassId(null);
        setStudents([]);
        setError("No class is assigned to this teacher.");
        return;
      }

      setClassId(Number(classes[0].id));
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load teacher class."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    if (!classId) return;

    try {
      setLoading(true);
      setError("");

      const studentsResponse = await getStudents();

      const allStudents: Student[] = Array.isArray(studentsResponse)
        ? (studentsResponse as Student[])
        : ((studentsResponse?.data ?? []) as Student[]);

      const classStudents = allStudents.filter(
        (student) => Number(student.classId) === Number(classId)
      );

      setStudents(classStudents);

      const response = await getStudentAttendance({
        classId,
        date,
      });

      const records = Array.isArray(response)
        ? response
        : response?.data ?? [];

      const map: AttendanceMap = {};

      classStudents.forEach((student) => {
        map[student.id] = "NOT_MARKED";
      });

      records.forEach((record: any) => {
        if (record.studentId) {
          map[Number(record.studentId)] = record.status;
        }
      });

      setAttendance(map);
    } catch (err) {
      console.error(err);
      setError("Unable to load student attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherClass();
  }, []);

  useEffect(() => {
    if (classId) {
      loadAttendance();
    }
  }, [classId, date]);

  const updateStatus = (
    studentId: number,
    status: StudentAttendanceStatus
  ) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));
  };

  const markAllPresent = () => {
    const updated: AttendanceMap = {};

    students.forEach((student) => {
      updated[student.id] = "PRESENT";
    });

    setAttendance(updated);
  };

  const saveAttendance = async () => {
    if (!classId) return;

    const unmarked = students.filter(
      (student) => attendance[student.id] === "NOT_MARKED"
    );

    if (unmarked.length > 0) {
      setError(
        `Please mark attendance for all students. ${unmarked.length} student(s) are still unmarked.`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await markStudentAttendance({
        classId,
        date,
        students: students.map((student) => ({
          studentId: student.id,
          status: attendance[student.id] as StudentAttendanceStatus,
        })),
      });

      await loadAttendance();
    } catch (err) {
      console.error(err);
      setError("Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let notMarked = 0;

    Object.values(attendance).forEach((status) => {
      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else if (status === "LEAVE") leave++;
      else notMarked++;
    });

    return {
      present,
      absent,
      leave,
      notMarked,
    };
  }, [attendance]);

  if (loading && !students.length) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Student Attendance
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Loading attendance...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-5 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Student Attendance
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Mark attendance for your students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-gray-50 border-b">
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500">Present</p>
          <p className="text-xl font-semibold text-green-600">
            {summary.present}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500">Absent</p>
          <p className="text-xl font-semibold text-red-600">
            {summary.absent}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500">Leave</p>
          <p className="text-xl font-semibold text-yellow-600">
            {summary.leave}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500">Not Marked</p>
          <p className="text-xl font-semibold text-gray-500">
            {summary.notMarked}
          </p>
        </div>
      </div>

      <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={markAllPresent}
          disabled={!students.length || saving}
          className="px-4 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 disabled:opacity-50"
        >
          Mark All Present
        </button>

        <button
          type="button"
          onClick={saveAttendance}
          disabled={!students.length || saving}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="p-5">
        {!students.length ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500">
              No students found in your assigned class.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student, index) => {
              const status =
                attendance[student.id] ?? "NOT_MARKED";

              return (
                <div
                  key={student.id}
                  className="border rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>

                      <p className="text-xs text-gray-500">
                        ID: {student.studentId}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {STATUS_OPTIONS.map((option) => {
                      const selected = status === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            updateStatus(student.id, option)
                          }
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                            selected
                              ? option === "PRESENT"
                                ? "bg-green-600 text-white border-green-600"
                                : option === "ABSENT"
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-yellow-500 text-white border-yellow-500"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}

                    {status === "NOT_MARKED" && (
                      <span className="text-xs text-gray-400">
                        Not Marked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentAttendance;