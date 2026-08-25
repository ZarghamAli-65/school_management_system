"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getStudentAttendance,
  markStudentAttendance,
} from "@/lib/api/attendance.api";
import { getClasses, getStudents } from "@/lib/api";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";

type ClassItem = {
  id: number;
  grade: number;
  section?: string | null;
  academicYear?: string | null;
  roomNo?: string | null;
};

type Student = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  studentId?: string | null;
  classId?: number | null;
};

const statuses: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LEAVE",
];

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [attendance, setAttendance] = useState<
    Record<number, AttendanceStatus>
  >({});

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setAttendance({});
      return;
    }

    loadStudents();
    loadAttendance();
  }, [selectedClassId, date]);

  async function loadClasses() {
    try {
      setLoading(true);
      setError("");

      const data = await getClasses();

      setClasses(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load assigned classes.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    try {
      setStudentsLoading(true);
      setError("");

      const data = await getStudents();

      const filtered = data.filter(
        (student: Student) =>
          student.classId === Number(selectedClassId),
      );

      setStudents(filtered);
    } catch (err) {
      console.error(err);
      setError("Unable to load students.");
    } finally {
      setStudentsLoading(false);
    }
  }

  async function loadAttendance() {
    try {
      setError("");

      const data = await getStudentAttendance({
        classId: Number(selectedClassId),
        date,
      });

      const mapped: Record<number, AttendanceStatus> = {};

      data.forEach((record: any) => {
        mapped[record.studentId] = record.status;
      });

      setAttendance(mapped);
    } catch (err) {
      console.error(err);
      setAttendance({});
    }
  }

  function setStudentStatus(
    studentId: number,
    status: AttendanceStatus,
  ) {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));
  }

  function markAll(status: AttendanceStatus) {
    const updated: Record<number, AttendanceStatus> = {};

    students.forEach((student) => {
      updated[student.id] = status;
    });

    setAttendance(updated);
  }

  async function saveAttendance() {
    if (!selectedClassId || !students.length) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await markStudentAttendance({
        classId: Number(selectedClassId),
        date,
        students: students.map((student) => ({
          studentId: student.id,
          status: attendance[student.id] ?? "PRESENT",
        })),
      });

      setMessage("Attendance saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  const selectedClass = useMemo(
    () =>
      classes.find(
        (item) => item.id === Number(selectedClassId),
      ),
    [classes, selectedClassId],
  );

  const presentCount = students.filter(
    (student) => attendance[student.id] === "PRESENT",
  ).length;

  const absentCount = students.filter(
    (student) => attendance[student.id] === "ABSENT",
  ).length;

  const leaveCount = students.filter(
    (student) => attendance[student.id] === "LEAVE",
  ).length;

  const unmarkedCount = students.filter(
    (student) => !attendance[student.id],
  ).length;

  const attendancePercentage =
    students.length > 0
      ? Math.round((presentCount / students.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Teacher Dashboard</span>
              <span>/</span>
              <span className="text-slate-900">
                Attendance
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Student Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage attendance for your assigned classes.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              📅
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Attendance Date
              </p>

              <p className="text-sm font-semibold text-slate-900">
                {new Date(
                  `${date}T00:00:00`,
                ).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* FILTER CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Attendance Filters
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select one of your assigned classes and attendance date.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* CLASS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Class
              </label>

              <select
                value={selectedClassId}
                onChange={(e) =>
                  setSelectedClassId(e.target.value)
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="">
                  {loading
                    ? "Loading classes..."
                    : "Select an assigned class"}
                </option>

                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    Grade {item.grade}
                    {item.section
                      ? ` - Section ${item.section}`
                      : ""}
                    {item.academicYear
                      ? ` • ${item.academicYear}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Attendance Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>

        {/* SELECTED CLASS */}
        {selectedClass && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg text-white">
                  🎓
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Selected Class
                  </p>

                  <h2 className="text-lg font-bold text-slate-900">
                    Grade {selectedClass.grade}
                    {selectedClass.section
                      ? ` - Section ${selectedClass.section}`
                      : ""}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {selectedClass.academicYear
                      ? selectedClass.academicYear
                      : "Academic Year"}
                    {selectedClass.roomNo
                      ? ` • Room ${selectedClass.roomNo}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-5 py-3 text-center">
                <p className="text-xs text-slate-500">
                  Total Students
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {students.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATS */}
        {selectedClassId && students.length > 0 && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Present
              </p>

              <div className="mt-2 flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">
                  {presentCount}
                </p>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {attendancePercentage}%
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Absent
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {absentCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Leave
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {leaveCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Unmarked
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {unmarkedCount}
              </p>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ATTENDANCE TABLE */}
        {!selectedClassId ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📋
            </div>

            <h3 className="font-semibold text-slate-900">
              Select a class
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Select one of your assigned classes above to view
              enrolled students and manage attendance.
            </p>
          </div>
        ) : studentsLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading students...
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <h3 className="font-semibold text-slate-900">
              No students found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              There are no students enrolled in this class.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* TABLE HEADER */}
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Student Attendance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Mark attendance for{" "}
                    {new Date(
                      `${date}T00:00:00`,
                    ).toLocaleDateString()}
                  </p>
                </div>

                {/* QUICK ACTIONS */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      markAll("PRESENT")
                    }
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Mark All Present
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      markAll("ABSENT")
                    }
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Mark All Absent
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      markAll("LEAVE")
                    }
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    Mark All Leave
                  </button>
                </div>
              </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student ID
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Attendance Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => {
                    const currentStatus =
                      attendance[student.id];

                    const name =
                      `${student.firstName ?? ""} ${
                        student.lastName ?? ""
                      }`.trim() ||
                      `Student #${student.id}`;

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {String(index + 1).padStart(
                            2,
                            "0",
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                              {(student.firstName?.[0] ??
                                "S"
                              ).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {name}
                              </p>

                              <p className="text-xs text-slate-400">
                                Student
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {student.studentId ??
                            `#${student.id}`}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setStudentStatus(
                                  student.id,
                                  "PRESENT",
                                )
                              }
                              className={`min-w-[92px] rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                currentStatus ===
                                "PRESENT"
                                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              ✓ Present
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setStudentStatus(
                                  student.id,
                                  "ABSENT",
                                )
                              }
                              className={`min-w-[92px] rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                currentStatus ===
                                "ABSENT"
                                  ? "border-red-600 bg-red-600 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                              }`}
                            >
                              ✕ Absent
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setStudentStatus(
                                  student.id,
                                  "LEAVE",
                                )
                              }
                              className={`min-w-[92px] rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                currentStatus === "LEAVE"
                                  ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                              }`}
                            >
                              ◷ Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="divide-y divide-slate-100 md:hidden">
              {students.map((student, index) => {
                const currentStatus =
                  attendance[student.id];

                const name =
                  `${student.firstName ?? ""} ${
                    student.lastName ?? ""
                  }`.trim() ||
                  `Student #${student.id}`;

                return (
                  <div
                    key={student.id}
                    className="p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                          {String(index + 1).padStart(
                            2,
                            "0",
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {student.studentId ??
                              `Student #${student.id}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setStudentStatus(
                            student.id,
                            "PRESENT",
                          )
                        }
                        className={`rounded-lg border px-2 py-2.5 text-xs font-semibold ${
                          currentStatus === "PRESENT"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        Present
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setStudentStatus(
                            student.id,
                            "ABSENT",
                          )
                        }
                        className={`rounded-lg border px-2 py-2.5 text-xs font-semibold ${
                          currentStatus === "ABSENT"
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        Absent
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setStudentStatus(
                            student.id,
                            "LEAVE",
                          )
                        }
                        className={`rounded-lg border px-2 py-2.5 text-xs font-semibold ${
                          currentStatus === "LEAVE"
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SAVE BAR */}
            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {students.length} students
                </p>

                <p className="text-xs text-slate-500">
                  {unmarkedCount > 0
                    ? `${unmarkedCount} student${
                        unmarkedCount > 1 ? "s" : ""
                      } still unmarked`
                    : "All students have an attendance status."}
                </p>
              </div>

              <button
                type="button"
                onClick={saveAttendance}
                disabled={saving || unmarkedCount > 0}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving
                  ? "Saving Attendance..."
                  : "Save Attendance"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}