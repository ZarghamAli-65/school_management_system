"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import { getClasses } from "@/lib/api/class.api";
import { role } from "@/lib/data";

type Class = {
  id: number;

  section?: string;
  grade: number;
  academicYear?: string;
  roomNo?: string;

  capacity: number;
  enrolledCount?: number;

  supervisor?: string;

  deletedAt?: string;
  isActive?: boolean;
};

const columns = [
  {
    header: "Section",
    accessor: "section",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Academic Year",
    accessor: "academicYear",
    className: "hidden md:table-cell",
  },
  {
    header: "Room",
    accessor: "roomNo",
    className: "hidden lg:table-cell",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden lg:table-cell",
  },
  {
    header: "Enrolled",
    accessor: "enrolledCount",
    className: "hidden xl:table-cell",
  },
  {
    header: "Supervisor",
    accessor: "supervisor",
    className: "hidden xl:table-cell",
  },
  {
    header: "Status",
    accessor: "isActive",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ClassListPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getClasses();

      setClasses(data);
    } catch (error) {
      console.error("Failed to load classes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const renderRow = (item: Class) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* SECTION */}
      <td className="p-4 font-semibold">
        {item.section || "-"}
      </td>

      {/* GRADE */}
      <td className="hidden md:table-cell">
        {item.grade}
      </td>

      {/* ACADEMIC YEAR */}
      <td className="hidden md:table-cell">
        {item.academicYear || "-"}
      </td>

      {/* ROOM */}
      <td className="hidden lg:table-cell">
        {item.roomNo || "-"}
      </td>

      {/* CAPACITY */}
      <td className="hidden lg:table-cell">
        {item.capacity}
      </td>

      {/* ENROLLED */}
      <td className="hidden xl:table-cell">
        {item.enrolledCount ?? 0}
      </td>

      {/* SUPERVISOR */}
      <td className="hidden xl:table-cell">
        {item.supervisor || "-"}
      </td>

      {/* STATUS */}
      <td className="hidden md:table-cell">
        <span
          className={
            item.isActive
              ? "text-green-600 font-medium"
              : "text-red-500 font-medium"
          }
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      </td>

      {/* ACTIONS */}
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                table="class"
                type="update"
                data={item}
                onSuccess={fetchClasses}
              />

              <FormModal
                table="class"
                type="delete"
                id={item.id}
                onSuccess={fetchClasses}
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
          All Classes
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            {/* FILTER */}
            <button
              type="button"
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
                table="class"
                type="create"
                onSuccess={fetchClasses}
              />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="py-10 text-center text-gray-500">
          Loading classes...
        </div>
      ) : (
        <Table
          columns={columns}
          renderRow={renderRow}
          data={classes}
        />
      )}

      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ClassListPage;