"use client";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import { getLessons } from "@/lib/api/classSchedule.api";
import Image from "next/image";
import { useEffect, useState } from "react";

type ClassSchedule = {
  id: number;

  subjectId: number;
  classId: number;
  teacherId: number;

  subject?: {
    id: number;
    name: string;
    code?: string;
  };

  class?: {
    id: number;
    grade: number;
    section?: string;
  };

  teacher?: {
    id: number;
    firstName?: string;
    lastName?: string;
  };

  day:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY";

  startTime: string;
  endTime: string;
};

const columns = [
  {
    header: "Subject",
    accessor: "subject",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Teacher",
    accessor: "teacher",
  },
  {
    header: "Day",
    accessor: "day",
    className: "hidden md:table-cell",
  },
  {
    header: "Start Time",
    accessor: "startTime",
    className: "hidden lg:table-cell",
  },
  {
    header: "End Time",
    accessor: "endTime",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ClassScheduleListPage = () => {
  const [classSchedules, setClassSchedules] = useState<
    ClassSchedule[]
  >([]);

  const [loading, setLoading] = useState(true);

  const fetchClassSchedules = async () => {
    try {
      setLoading(true);

      const data = await getLessons();

      setClassSchedules(data);
    } catch (error) {
      console.error(
        "Failed to fetch class schedules:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassSchedules();
  }, []);

  const formatTime = (time: string) => {
    if (!time) return "-";

    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRow = (item: ClassSchedule) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* SUBJECT */}
      <td className="p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.subject?.name || "N/A"}
          </h3>

          {item.subject?.code && (
            <p className="text-xs text-gray-500">
              {item.subject.code}
            </p>
          )}
        </div>
      </td>

      {/* CLASS */}
      <td>
        {item.class ? (
          <>
            Grade {item.class.grade}
            {item.class.section
              ? ` - ${item.class.section}`
              : ""}
          </>
        ) : (
          "N/A"
        )}
      </td>

      {/* TEACHER */}
      <td>
        {item.teacher
          ? `${item.teacher.firstName || ""} ${
              item.teacher.lastName || ""
            }`.trim()
          : "N/A"}
      </td>

      {/* DAY */}
      <td className="hidden md:table-cell">
        {item.day}
      </td>

      {/* START TIME */}
      <td className="hidden lg:table-cell">
        {formatTime(item.startTime)}
      </td>

      {/* END TIME */}
      <td className="hidden lg:table-cell">
        {formatTime(item.endTime)}
      </td>

      {/* ACTIONS */}
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                table="lesson"
                type="update"
                data={item}
                onSuccess={fetchClassSchedules}
              />

              <FormModal
                table="lesson"
                type="delete"
                id={item.id}
                onSuccess={fetchClassSchedules}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Class Schedules
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            {/* FILTER */}
            <button
              type="button"
              title="Filter"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <Image
                src="/filter.png"
                alt="Filter"
                width={14}
                height={14}
              />
            </button>

            {/* SORT */}
            <button
              type="button"
              title="Sort"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <Image
                src="/sort.png"
                alt="Sort"
                width={14}
                height={14}
              />
            </button>

            {/* CREATE */}
            {role === "admin" && (
              <FormModal
                table="lesson"
                type="create"
                onSuccess={fetchClassSchedules}
              />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="p-4">
          Loading class schedules...
        </p>
      ) : (
        <Table
          columns={columns}
          renderRow={renderRow}
          data={classSchedules}
        />
      )}

      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ClassScheduleListPage;