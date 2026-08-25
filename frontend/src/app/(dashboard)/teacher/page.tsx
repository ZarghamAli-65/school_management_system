"use client";

import Announcements from "@/components/Annoucments";
import BigCalendar from "@/components/BigCalendar";
import TeacherStudentAttendance from "@/components/TeacherStudentAttendance";

const TeacherPage = () => {
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <TeacherStudentAttendance />

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            Class Schedule
          </h1>

          <BigCalendar />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;