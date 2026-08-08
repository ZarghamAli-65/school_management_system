"use client";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import { getSubjects } from "@/lib/api/subject.api";
import Image from "next/image";
import { useEffect, useState } from "react";

type SubjectTeacher = {
  teacherId: number;
  teacher?: {
    firstName?: string;
    lastName?: string;
  };
};

type Subject = {
  id: number;
  code: string;
  name: string;
  description?: string;
  teachers?: SubjectTeacher[];
};

const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Code",
    accessor: "code",
    className: "hidden md:table-cell",
  },
  {
    header: "Teachers",
    accessor: "teachers",
    className: "hidden md:table-cell",
  },
  {
    header: "Description",
    accessor: "description",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const SubjectListPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const data = await getSubjects();

      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const renderRow = (item: Subject) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Subject Name */}
      <td className="p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.name}
          </h3>

          <p className="text-xs text-gray-500">
            {item.code}
          </p>
        </div>
      </td>

      {/* Code */}
      <td className="hidden md:table-cell">
        {item.code}
      </td>

      {/* Teachers */}
      <td className="hidden md:table-cell">
        {item.teachers?.length ? (
          <div className="flex flex-col">
            {item.teachers.map((item) => (
              <span key={item.teacherId}>
                {item.teacher?.firstName || ""}{" "}
                {item.teacher?.lastName || ""}
              </span>
            ))}
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* Description */}
      <td className="hidden lg:table-cell">
        {item.description || "-"}
      </td>

      {/* Actions */}
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                table="subject"
                type="update"
                data={item}
                onSuccess={fetchSubjects}
              />

              <FormModal
                table="subject"
                type="delete"
                id={item.id}
                onSuccess={fetchSubjects}
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
          All Subjects
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
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

            {role === "admin" && (
              <FormModal
                table="subject"
                type="create"
                onSuccess={fetchSubjects}
              />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="p-4">
          Loading subjects...
        </p>
      ) : (
        <Table
          columns={columns}
          renderRow={renderRow}
          data={subjects}
        />
      )}

      <Pagination />
    </div>
  );
};

export default SubjectListPage;