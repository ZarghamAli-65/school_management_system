"use client";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getStudents } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Student = {
  id: number;
  studentId: string;

  firstName: string;
  lastName: string;

  email?: string;
  phone?: string;
  photo?: string;

  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;

  class?: {
    id: number;
    name: string;
  };
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student ID",
    accessor: "studentId",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "City",
    accessor: "city",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const StudentListPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get user role
  useEffect(() => {
    const getUserRole = () => {
      const userData = localStorage.getItem("user");

      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.role || "";
        } catch {
          // Ignore invalid JSON
        }
      }

      const cookies = document.cookie.split(";");

      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");

        if (name === "role") {
          return value;
        }
      }

      return "";
    };

    setUserRole(getUserRole());
  }, []);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getStudents();

        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load students."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [refreshKey]);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderRow = (item: Student) => {
    const fullName = `${item.firstName} ${item.lastName}`;

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        {/* INFO */}
        <td className="flex items-center gap-4 p-4">
          <Image
            src={item.photo || "/default-avatar.png"}
            alt={fullName}
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />

          <div className="flex flex-col">
            <h3 className="font-semibold">{fullName}</h3>

            <p className="text-xs text-gray-500">
              {item.email || "-"}
            </p>
          </div>
        </td>

        {/* STUDENT ID */}
        <td className="hidden md:table-cell">
          {item.studentId}
        </td>

        {/* CLASS */}
        <td className="hidden md:table-cell">
          {item.class?.name || "-"}
        </td>

        {/* PHONE */}
        <td className="hidden lg:table-cell">
          {item.phone || "-"}
        </td>

        {/* CITY */}
        <td className="hidden lg:table-cell">
          {item.city || "-"}
        </td>

        {/* ACTIONS */}
        <td>
          <div className="flex items-center gap-2">
            {/* VIEW */}
            <Link href={`/list/students/${item.id}`}>
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky"
              >
                <Image
                  src="/view.png"
                  alt="View"
                  width={16}
                  height={16}
                />
              </button>
            </Link>

            {/* EDIT */}
            {userRole.toLowerCase() === "admin" && (
              <FormModal
                table="student"
                type="update"
                data={item}
                onSuccess={handleSuccess}
              />
            )}

            {/* DELETE */}
            {userRole.toLowerCase() === "admin" && (
              <FormModal
                table="student"
                type="delete"
                id={item.id}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-lamaPurple border-t-transparent rounded-full animate-spin" />

          <p className="text-gray-500">
            Loading students...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold">
              ⚠️ Error
            </p>

            <p className="text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSuccess}
            className="px-4 py-2 bg-lamaPurple text-white rounded-md hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Students
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
            {userRole.toLowerCase() === "admin" && (
              <FormModal
                table="student"
                type="create"
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        renderRow={renderRow}
        data={students}
      />

      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default StudentListPage;