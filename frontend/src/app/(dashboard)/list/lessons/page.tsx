"use client";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import { getLessons } from "@/lib/api";
import Image from "next/image";
import { useEffect, useState } from "react";

type Lesson = {
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
    name: string;
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

const LessonListPage = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      setLoading(true);

      const data = await getLessons();

      setLessons(data);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const formatTime = (time: string) => {
    if (!time) return "";

    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRow = (item: Lesson) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Subject */}
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

      {/* Class */}
      <td>
        {item.class?.name || "N/A"}
      </td>

      {/* Teacher */}
      <td>
        {item.teacher
          ? `${item.teacher.firstName || ""} ${
              item.teacher.lastName || ""
            }`.trim()
          : "N/A"}
      </td>

      {/* Day */}
      <td className="hidden md:table-cell">
        {item.day}
      </td>

      {/* Start Time */}
      <td className="hidden lg:table-cell">
        {formatTime(item.startTime)}
      </td>

      {/* End Time */}
      <td className="hidden lg:table-cell">
        {formatTime(item.endTime)}
      </td>

      {/* Actions */}
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                table="lesson"
                type="update"
                data={item}
                onSuccess={fetchLessons}
              />

              <FormModal
                table="lesson"
                type="delete"
                id={item.id}
                onSuccess={fetchLessons}
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
          All Lessons
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            {/* Filter */}
            <button
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

            {/* Sort */}
            <button
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

            {/* Add Lesson */}
            {role === "admin" && (
              <FormModal
                table="lesson"
                type="create"
                onSuccess={fetchLessons}
              />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="p-4">
          Loading lessons...
        </p>
      ) : (
        <Table
          columns={columns}
          renderRow={renderRow}
          data={lessons}
        />
      )}

      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default LessonListPage;