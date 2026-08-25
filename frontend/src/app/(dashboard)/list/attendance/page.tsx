"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getClasses,
  getStudents,
  getTeachers,
  getStudentAttendance,
  getTeacherAttendance,
  markStudentAttendance,
  markTeacherAttendance,
} from "@/lib/api";

type ClassItem = {
  id: number;
  name: string;
};

type Student = {
  id: number;
  studentId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  photo?: string;
  classId?: number;
  class?: {
    id: number;
    name: string;
  };
};

type Teacher = {
  id: number;
  teacherId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  photo?: string;
};

type StudentStatus = "PRESENT" | "ABSENT" | "LEAVE";

type TeacherStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "LEAVE";

type StudentAttendanceRecord = {
  studentId: number;
  status: StudentStatus;
};

type TeacherAttendanceRecord = {
  teacherId: number;
  status: TeacherStatus;
};

const studentStatuses: StudentStatus[] = [
  "PRESENT",
  "ABSENT",
  "LEAVE",
];

const teacherStatuses: TeacherStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "HALF_DAY",
  "LEAVE",
];

const formatStatus = (status: string) =>
  status
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusStyles: Record<string, string> = {
  PRESENT:
    "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
  ABSENT:
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  LEAVE:
    "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  LATE:
    "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  HALF_DAY:
    "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
};

const selectedStatusStyles: Record<string, string> = {
  PRESENT:
    "border-green-600 bg-green-600 text-white shadow-sm",
  ABSENT:
    "border-red-600 bg-red-600 text-white shadow-sm",
  LEAVE:
    "border-amber-500 bg-amber-500 text-white shadow-sm",
  LATE:
    "border-orange-500 bg-orange-500 text-white shadow-sm",
  HALF_DAY:
    "border-blue-600 bg-blue-600 text-white shadow-sm",
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

const AttendancePage = () => {
  const [attendanceType, setAttendanceType] = useState<
    "student" | "teacher"
  >("student");

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(getToday());

  /**
   * IMPORTANT:
   *
   * These maps contain ONLY attendance that has actually
   * been selected/loaded from the database.
   *
   * If an ID does not exist in the map:
   * => NOT MARKED
   */
  const [studentAttendance, setStudentAttendance] =
    useState<Record<number, StudentStatus>>({});

  const [teacherAttendance, setTeacherAttendance] =
    useState<Record<number, TeacherStatus>>({});

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  /**
   * Prevent old API requests from overwriting
   * the latest selected date/class/type.
   */
  const attendanceRequestId = useRef(0);

  /**
   * -------------------------------------------------------
   * LOAD INITIAL DATA
   * -------------------------------------------------------
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          classesData,
          studentsData,
          teachersData,
        ] = await Promise.all([
          getClasses(),
          getStudents(),
          getTeachers(),
        ]);

        setClasses(
          Array.isArray(classesData)
            ? classesData
            : classesData?.data ?? []
        );

        setStudents(
          Array.isArray(studentsData)
            ? studentsData
            : studentsData?.data ?? []
        );

        setTeachers(
          Array.isArray(teachersData)
            ? teachersData
            : teachersData?.data ?? []
        );
      } catch (err) {
        console.error(
          "Failed to load attendance data:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load attendance data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * -------------------------------------------------------
   * FILTER STUDENTS BY CLASS
   * -------------------------------------------------------
   */
  const filteredStudents = useMemo(() => {
    if (!classId) return [];

    return students.filter((student) => {
      if (student.classId !== undefined) {
        return (
          Number(student.classId) === Number(classId)
        );
      }

      return (
        Number(student.class?.id) === Number(classId)
      );
    });
  }, [students, classId]);

  /**
   * -------------------------------------------------------
   * SELECTED CLASS
   * -------------------------------------------------------
   */
  const selectedClass = useMemo(
    () =>
      classes.find(
        (item) => item.id === Number(classId)
      ),
    [classes, classId]
  );

  /**
   * -------------------------------------------------------
   * STUDENT SUMMARY
   * -------------------------------------------------------
   */
  const studentSummary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let notMarked = 0;

    filteredStudents.forEach((student) => {
      const status = studentAttendance[student.id];

      if (status === "PRESENT") {
        present++;
      } else if (status === "ABSENT") {
        absent++;
      } else if (status === "LEAVE") {
        leave++;
      } else {
        notMarked++;
      }
    });

    return {
      total: filteredStudents.length,
      present,
      absent,
      leave,
      notMarked,
    };
  }, [filteredStudents, studentAttendance]);

  /**
   * -------------------------------------------------------
   * TEACHER SUMMARY
   * -------------------------------------------------------
   */
  const teacherSummary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    let leave = 0;
    let notMarked = 0;

    teachers.forEach((teacher) => {
      const status = teacherAttendance[teacher.id];

      if (status === "PRESENT") {
        present++;
      } else if (status === "ABSENT") {
        absent++;
      } else if (status === "LATE") {
        late++;
      } else if (status === "HALF_DAY") {
        halfDay++;
      } else if (status === "LEAVE") {
        leave++;
      } else {
        notMarked++;
      }
    });

    return {
      total: teachers.length,
      present,
      absent,
      late,
      halfDay,
      leave,
      notMarked,
    };
  }, [teachers, teacherAttendance]);

  /**
   * -------------------------------------------------------
   * LOAD EXISTING ATTENDANCE
   * -------------------------------------------------------
   *
   * Database record exists:
   *    => show its status
   *
   * Database record does NOT exist:
   *    => leave map empty
   *    => UI shows "Not Marked"
   *
   * NO DEFAULT PRESENT HERE.
   */
  useEffect(() => {
    const requestId = ++attendanceRequestId.current;
    let isActive = true;

    const loadAttendance = async () => {
      /**
       * Student attendance requires class.
       */
      if (
        attendanceType === "student" &&
        !classId
      ) {
        setStudentAttendance({});
        setAttendanceLoading(false);
        return;
      }

      try {
        setAttendanceLoading(true);
        setError(null);
        setSuccess("");

        /**
         * Immediately clear previous state.
         *
         * This prevents attendance from another
         * date/class appearing temporarily.
         */
        if (attendanceType === "student") {
          setStudentAttendance({});
        } else {
          setTeacherAttendance({});
        }

        /**
         * -------------------------------
         * STUDENT ATTENDANCE
         * -------------------------------
         */
        if (attendanceType === "student") {
          const response =
            await getStudentAttendance({
              classId: Number(classId),
              date,
            });

          if (
            !isActive ||
            requestId !== attendanceRequestId.current
          ) {
            return;
          }

          const records =
            (response?.data ??
              response ??
              []) as StudentAttendanceRecord[];

          const statusMap: Record<
            number,
            StudentStatus
          > = {};

          records.forEach((record) => {
            if (
              record.studentId !== undefined &&
              record.status
            ) {
              statusMap[Number(record.studentId)] =
                record.status;
            }
          });

          setStudentAttendance(statusMap);
        }

        /**
         * -------------------------------
         * TEACHER ATTENDANCE
         * -------------------------------
         */
        if (attendanceType === "teacher") {
          const response =
            await getTeacherAttendance({
              date,
            });

          if (
            !isActive ||
            requestId !== attendanceRequestId.current
          ) {
            return;
          }

          const records =
            (response?.data ??
              response ??
              []) as TeacherAttendanceRecord[];

          const statusMap: Record<
            number,
            TeacherStatus
          > = {};

          records.forEach((record) => {
            if (
              record.teacherId !== undefined &&
              record.status
            ) {
              statusMap[Number(record.teacherId)] =
                record.status;
            }
          });

          setTeacherAttendance(statusMap);
        }
      } catch (err) {
        if (
          !isActive ||
          requestId !== attendanceRequestId.current
        ) {
          return;
        }

        console.error(
          "Failed to load existing attendance:",
          err
        );

        if (attendanceType === "student") {
          setStudentAttendance({});
        } else {
          setTeacherAttendance({});
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load existing attendance."
        );
      } finally {
        if (
          isActive &&
          requestId === attendanceRequestId.current
        ) {
          setAttendanceLoading(false);
        }
      }
    };

    loadAttendance();

    return () => {
      isActive = false;
    };
  }, [attendanceType, classId, date]);

  /**
   * -------------------------------------------------------
   * SWITCH STUDENT / TEACHER
   * -------------------------------------------------------
   */
  const switchAttendanceType = (
    type: "student" | "teacher"
  ) => {
    setAttendanceType(type);

    setError(null);
    setSuccess("");

    /**
     * Clear previous UI state immediately.
     */
    if (type === "student") {
      setStudentAttendance({});
    } else {
      setTeacherAttendance({});
    }
  };

  /**
   * -------------------------------------------------------
   * SET STUDENT STATUS
   * -------------------------------------------------------
   */
  const setStudentStatus = (
    studentId: number,
    status: StudentStatus
  ) => {
    setStudentAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));

    setSuccess("");
    setError(null);
  };

  /**
   * -------------------------------------------------------
   * SET TEACHER STATUS
   * -------------------------------------------------------
   */
  const setTeacherStatus = (
    teacherId: number,
    status: TeacherStatus
  ) => {
    setTeacherAttendance((previous) => ({
      ...previous,
      [teacherId]: status,
    }));

    setSuccess("");
    setError(null);
  };

  /**
   * -------------------------------------------------------
   * MARK ALL STUDENTS PRESENT
   * -------------------------------------------------------
   *
   * This is intentional.
   *
   * Unlike the old fallback:
   *
   *   status ?? "PRESENT"
   *
   * this only marks everyone present when the
   * user explicitly clicks this button.
   */
  const setAllStudentsPresent = () => {
    const attendance: Record<
      number,
      StudentStatus
    > = {};

    filteredStudents.forEach((student) => {
      attendance[student.id] = "PRESENT";
    });

    setStudentAttendance(attendance);

    setSuccess("");
    setError(null);
  };

  /**
   * -------------------------------------------------------
   * SAVE STUDENT ATTENDANCE
   * -------------------------------------------------------
   */
  const saveStudentAttendance = async () => {
    if (!classId) {
      setError("Please select a class.");
      setSuccess("");
      return;
    }

    if (!filteredStudents.length) {
      setError(
        "No students found in the selected class."
      );
      setSuccess("");
      return;
    }

    /**
     * IMPORTANT:
     *
     * Do NOT automatically mark missing students PRESENT.
     *
     * Find students whose attendance was not selected.
     */
    const unmarkedStudents =
      filteredStudents.filter(
        (student) =>
          !studentAttendance[student.id]
      );

    if (unmarkedStudents.length > 0) {
      setError(
        `Please mark attendance for all students. ${unmarkedStudents.length} student(s) are still unmarked.`
      );

      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess("");

      /**
       * Every student now has an explicit status.
       */
      await markStudentAttendance({
        classId: Number(classId),
        date,
        students: filteredStudents.map(
          (student) => ({
            studentId: student.id,
            status:
              studentAttendance[
                student.id
              ] as StudentStatus,
          })
        ),
      });

      setSuccess(
        "Student attendance saved successfully."
      );

      /**
       * Invalidate previous requests.
       */
      const requestId =
        ++attendanceRequestId.current;

      setAttendanceLoading(true);

      /**
       * Reload from DATABASE.
       *
       * This confirms that the saved data actually
       * exists on the backend.
       */
      const response =
        await getStudentAttendance({
          classId: Number(classId),
          date,
        });

      if (
        requestId === attendanceRequestId.current
      ) {
        const records =
          (response?.data ??
            response ??
            []) as StudentAttendanceRecord[];

        const statusMap: Record<
          number,
          StudentStatus
        > = {};

        records.forEach((record) => {
          if (
            record.studentId !== undefined &&
            record.status
          ) {
            statusMap[
              Number(record.studentId)
            ] = record.status;
          }
        });

        setStudentAttendance(statusMap);
      }
    } catch (err) {
      console.error(
        "Failed to save student attendance:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save student attendance."
      );
    } finally {
      setSaving(false);
      setAttendanceLoading(false);
    }
  };

  /**
   * -------------------------------------------------------
   * SAVE TEACHER ATTENDANCE
   * -------------------------------------------------------
   */
  const saveTeacherAttendance = async () => {
    if (!teachers.length) {
      setError("No teachers found.");
      setSuccess("");
      return;
    }

    /**
     * IMPORTANT:
     *
     * Do NOT default missing teacher attendance
     * to PRESENT.
     */
    const unmarkedTeachers =
      teachers.filter(
        (teacher) =>
          !teacherAttendance[teacher.id]
      );

    if (unmarkedTeachers.length > 0) {
      setError(
        `Please mark attendance for all teachers. ${unmarkedTeachers.length} teacher(s) are still unmarked.`
      );

      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess("");

      /**
       * Every teacher must have an explicitly
       * selected status.
       */
      await Promise.all(
        teachers.map((teacher) =>
          markTeacherAttendance({
            teacherId: teacher.id,
            date,
            status:
              teacherAttendance[
                teacher.id
              ] as TeacherStatus,
          })
        )
      );

      setSuccess(
        "Teacher attendance saved successfully."
      );

      /**
       * Invalidate old requests.
       */
      const requestId =
        ++attendanceRequestId.current;

      setAttendanceLoading(true);

      /**
       * Reload actual database data.
       */
      const response =
        await getTeacherAttendance({
          date,
        });

      if (
        requestId === attendanceRequestId.current
      ) {
        const records =
          (response?.data ??
            response ??
            []) as TeacherAttendanceRecord[];

        const statusMap: Record<
          number,
          TeacherStatus
        > = {};

        records.forEach((record) => {
          if (
            record.teacherId !== undefined &&
            record.status
          ) {
            statusMap[
              Number(record.teacherId)
            ] = record.status;
          }
        });

        setTeacherAttendance(statusMap);
      }
    } catch (err) {
      console.error(
        "Failed to save teacher attendance:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save teacher attendance."
      );
    } finally {
      setSaving(false);
      setAttendanceLoading(false);
    }
  };

  /**
   * -------------------------------------------------------
   * LOADING
   * -------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl flex-1 m-4 mt-0 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-lamaPurple border-t-transparent rounded-full animate-spin" />

          <p className="text-sm text-gray-500">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 m-4 mt-0 min-w-0">
      {/* HEADER */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-lamaPurpleLight flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Attendance Management
                </h1>

                <p className="text-xs text-gray-500 mt-1">
                  Record and manage daily attendance
                  for students and teachers
                </p>
              </div>
            </div>
          </div>

          {/* STUDENT / TEACHER TOGGLE */}
          <div className="w-full xl:w-auto">
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                type="button"
                onClick={() =>
                  switchAttendanceType("student")
                }
                className={`flex-1 xl:flex-none min-w-[150px] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  attendanceType === "student"
                    ? "bg-white text-lamaPurple shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">
                  👨‍🎓
                </span>
                Students
              </button>

              <button
                type="button"
                onClick={() =>
                  switchAttendanceType("teacher")
                }
                className={`flex-1 xl:flex-none min-w-[150px] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  attendanceType === "teacher"
                    ? "bg-white text-lamaPurple shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">
                  👨‍🏫
                </span>
                Teachers
              </button>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendanceType === "student" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Select Class
              </label>

              <div className="relative">
                <select
                  value={classId}
                  onChange={(event) =>
                    setClassId(event.target.value)
                  }
                  className="w-full appearance-none border border-gray-200 bg-white rounded-lg px-4 py-3 pr-10 text-sm font-medium text-gray-700 outline-none focus:border-lamaPurple focus:ring-2 focus:ring-purple-100 transition"
                >
                  <option value="">
                    Choose a class...
                  </option>

                  {classes.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ▼
                </span>
              </div>

              {selectedClass && (
                <p className="text-xs text-lamaPurple font-medium mt-2">
                  Selected:{" "}
                  {selectedClass.name}
                </p>
              )}
            </div>
          )}

          <div
            className={
              attendanceType === "teacher"
                ? "md:col-span-2"
                : ""
            }
          >
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Attendance Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-lamaPurple focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {(error || success) && (
        <div className="mt-4">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
              <span className="font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm">
              <span className="font-bold">✓</span>
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          STUDENT SECTION
      ===================================================== */}
      {attendanceType === "student" && (
        <div className="mt-5">
          {!classId ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 min-h-[360px] flex flex-col items-center justify-center text-center px-5">
              <div className="w-16 h-16 rounded-full bg-lamaPurpleLight flex items-center justify-center mb-4">
                <span className="text-2xl">
                  👨‍🎓
                </span>
              </div>

              <h2 className="font-semibold text-gray-700">
                Select a Class
              </h2>

              <p className="text-sm text-gray-400 mt-1 max-w-sm">
                Choose a class above to view its
                enrolled students and mark their
                attendance.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 min-h-[360px] flex flex-col items-center justify-center text-center px-5">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-2xl">
                  👨‍🎓
                </span>
              </div>

              <h2 className="font-semibold text-gray-700">
                No Students Found
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                There are no students enrolled in
                this class.
              </p>
            </div>
          ) : (
            <>
              {/* STUDENT SUMMARY */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs text-gray-500">
                    Total Students
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {studentSummary.total}
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl border border-green-100 p-4">
                  <p className="text-xs text-green-700">
                    Present
                  </p>

                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {studentSummary.present}
                  </p>
                </div>

                <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                  <p className="text-xs text-red-700">
                    Absent
                  </p>

                  <p className="text-2xl font-bold text-red-700 mt-1">
                    {studentSummary.absent}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                  <p className="text-xs text-amber-700">
                    Leave
                  </p>

                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    {studentSummary.leave}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">
                    Not Marked
                  </p>

                  <p className="text-2xl font-bold text-gray-600 mt-1">
                    {studentSummary.notMarked}
                  </p>
                </div>
              </div>

              {/* STUDENT TABLE */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-800">
                      Student Attendance
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      {selectedClass?.name} •{" "}
                      {filteredStudents.length}{" "}
                      students
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={setAllStudentsPresent}
                    disabled={saving || attendanceLoading}
                    className="px-4 py-2.5 rounded-lg bg-lamaSky text-gray-700 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    ✓ Mark All Present
                  </button>
                </div>

                {attendanceLoading ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-lamaPurple border-t-transparent rounded-full animate-spin" />

                    <p className="text-sm text-gray-500">
                      Loading attendance...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px]">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                              Student
                            </th>

                            <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                              Student ID
                            </th>

                            <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                              Attendance Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredStudents.map(
                            (student) => {
                              const currentStatus =
                                studentAttendance[
                                  student.id
                                ];

                              const fullName = `${student.firstName} ${student.lastName}`;

                              return (
                                <tr
                                  key={student.id}
                                  className="border-t border-gray-100 hover:bg-gray-50/70 transition"
                                >
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <Image
                                        src={
                                          student.photo ||
                                          "/default-avatar.png"
                                        }
                                        alt={
                                          fullName
                                        }
                                        width={42}
                                        height={42}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                      />

                                      <div>
                                        <p className="font-semibold text-sm text-gray-800">
                                          {
                                            fullName
                                          }
                                        </p>

                                        <p className="text-xs text-gray-400 mt-0.5">
                                          {student.email ||
                                            "No email"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                                    {student.studentId ||
                                      `ST-${student.id}`}
                                  </td>

                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                      {studentStatuses.map(
                                        (status) => {
                                          const selected =
                                            currentStatus ===
                                            status;

                                          return (
                                            <button
                                              key={
                                                status
                                              }
                                              type="button"
                                              onClick={() =>
                                                setStudentStatus(
                                                  student.id,
                                                  status
                                                )
                                              }
                                              disabled={
                                                saving ||
                                                attendanceLoading
                                              }
                                              className={`min-w-[88px] px-3 py-2 rounded-lg border text-xs font-semibold transition-all disabled:opacity-50 ${
                                                selected
                                                  ? selectedStatusStyles[
                                                      status
                                                    ]
                                                  : statusStyles[
                                                      status
                                                    ]
                                              }`}
                                            >
                                              {selected && (
                                                <span className="mr-1">
                                                  ✓
                                                </span>
                                              )}

                                              {formatStatus(
                                                status
                                              )}
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>

                                    <p className="text-[11px] text-gray-400 mt-2">
                                      Selected:{" "}
                                      <span className="font-semibold text-gray-600">
                                        {currentStatus
                                          ? formatStatus(
                                              currentStatus
                                            )
                                          : "Not Marked"}
                                      </span>
                                    </p>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* STUDENT SAVE BAR */}
                    <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          {studentSummary.present}{" "}
                          present •{" "}
                          {studentSummary.absent}{" "}
                          absent •{" "}
                          {studentSummary.leave}{" "}
                          leave
                        </p>

                        {studentSummary.notMarked >
                          0 && (
                          <p className="text-xs text-red-500 mt-1">
                            {
                              studentSummary.notMarked
                            }{" "}
                            student(s) not marked
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={
                          saveStudentAttendance
                        }
                        disabled={
                          saving ||
                          attendanceLoading
                        }
                        className="px-6 py-3 bg-lamaPurple text-white rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving
                          ? "Saving Attendance..."
                          : "Save Student Attendance"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* =====================================================
          TEACHER SECTION
      ===================================================== */}
      {attendanceType === "teacher" && (
        <div className="mt-5">
          {/* TEACHER SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">
                Total
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-1">
                {teacherSummary.total}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl border border-green-100 p-4">
              <p className="text-xs text-green-700">
                Present
              </p>

              <p className="text-2xl font-bold text-green-700 mt-1">
                {teacherSummary.present}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-100 p-4">
              <p className="text-xs text-red-700">
                Absent
              </p>

              <p className="text-2xl font-bold text-red-700 mt-1">
                {teacherSummary.absent}
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
              <p className="text-xs text-orange-700">
                Late
              </p>

              <p className="text-2xl font-bold text-orange-700 mt-1">
                {teacherSummary.late}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <p className="text-xs text-blue-700">
                Half Day
              </p>

              <p className="text-2xl font-bold text-blue-700 mt-1">
                {teacherSummary.halfDay}
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
              <p className="text-xs text-amber-700">
                Leave
              </p>

              <p className="text-2xl font-bold text-amber-700 mt-1">
                {teacherSummary.leave}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">
                Not Marked
              </p>

              <p className="text-2xl font-bold text-gray-600 mt-1">
                {teacherSummary.notMarked}
              </p>
            </div>
          </div>

          {/* TEACHER TABLE */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                Teacher Attendance
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Mark attendance for{" "}
                {teacherSummary.total} teachers
              </p>
            </div>

            {teachers.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">
                    👨‍🏫
                  </span>
                </div>

                <h2 className="font-semibold text-gray-700">
                  No Teachers Found
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  There are no teachers available.
                </p>
              </div>
            ) : attendanceLoading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-lamaPurple border-t-transparent rounded-full animate-spin" />

                <p className="text-sm text-gray-500">
                  Loading attendance...
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Teacher
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Teacher ID
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Attendance Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {teachers.map((teacher) => {
                        const currentStatus =
                          teacherAttendance[
                            teacher.id
                          ];

                        const fullName = `${teacher.firstName} ${teacher.lastName}`;

                        return (
                          <tr
                            key={teacher.id}
                            className="border-t border-gray-100 hover:bg-gray-50/70 transition"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <Image
                                  src={
                                    teacher.photo ||
                                    "/default-avatar.png"
                                  }
                                  alt={fullName}
                                  width={42}
                                  height={42}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                />

                                <div>
                                  <p className="font-semibold text-sm text-gray-800">
                                    {fullName}
                                  </p>

                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {teacher.email ||
                                      "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                              {teacher.teacherId ||
                                `TCH-${teacher.id}`}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                {teacherStatuses.map(
                                  (status) => {
                                    const selected =
                                      currentStatus ===
                                      status;

                                    return (
                                      <button
                                        key={status}
                                        type="button"
                                        onClick={() =>
                                          setTeacherStatus(
                                            teacher.id,
                                            status
                                          )
                                        }
                                        disabled={
                                          saving ||
                                          attendanceLoading
                                        }
                                        className={`min-w-[82px] px-3 py-2 rounded-lg border text-xs font-semibold transition-all disabled:opacity-50 ${
                                          selected
                                            ? selectedStatusStyles[
                                                status
                                              ]
                                            : statusStyles[
                                                status
                                              ]
                                        }`}
                                      >
                                        {selected && (
                                          <span className="mr-1">
                                            ✓
                                          </span>
                                        )}

                                        {formatStatus(
                                          status
                                        )}
                                      </button>
                                    );
                                  }
                                )}
                              </div>

                              <p className="text-[11px] text-gray-400 mt-2">
                                Selected:{" "}
                                <span className="font-semibold text-gray-600">
                                  {currentStatus
                                    ? formatStatus(
                                        currentStatus
                                      )
                                    : "Not Marked"}
                                </span>
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* TEACHER SAVE BAR */}
                <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Attendance date:{" "}
                      <span className="font-semibold text-gray-700">
                        {date}
                      </span>
                    </p>

                    {teacherSummary.notMarked >
                      0 && (
                      <p className="text-xs text-red-500 mt-1">
                        {
                          teacherSummary.notMarked
                        }{" "}
                        teacher(s) not marked
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      saveTeacherAttendance
                    }
                    disabled={
                      saving ||
                      attendanceLoading
                    }
                    className="px-6 py-3 bg-lamaPurple text-white rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? "Saving Attendance..."
                      : "Save Teacher Attendance"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;