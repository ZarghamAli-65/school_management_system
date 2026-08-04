"use client";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getParents } from "@/lib/api/parent.api";
import Image from "next/image";
import { useEffect, useState } from "react";

type Parent = {
  id: number;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  gender?: string;
  image?: string;
  students: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student Names",
    accessor: "students",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ParentListPage = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get role from localStorage or cookies (if needed)
  const [userRole, setUserRole] = useState<string>("admin"); // default or fetch

  useEffect(() => {
    const getUserRole = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.role || "";
        } catch {}
      }
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "role") return value;
      }
      return "";
    };
    setUserRole(getUserRole());
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const data = await getParents();
      setParents(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load parents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [refreshKey]);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderRow = (item: Parent) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    const studentNames = item.students?.map((s) => s.name).join(", ") || "";

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">
          {item.image && (
            <Image
              src={item.image}
              alt={fullName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            <h3 className="font-semibold">{fullName}</h3>
            <p className="text-xs text-gray-500">{item.email || "No email"}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{studentNames || "—"}</td>
        <td className="hidden md:table-cell">{item.phone || "—"}</td>
        <td className="hidden md:table-cell">{item.address || "—"}</td>
        <td>
          <div className="flex items-center gap-2">
            {userRole.toLowerCase() === "admin" && (
              <>
                <FormModal
                  table="parent"
                  type="update"
                  data={item}
                  onSuccess={handleSuccess}
                />
                <FormModal
                  table="parent"
                  type="delete"
                  id={item.id}
                  onSuccess={handleSuccess}
                />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-lamaPurple border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading parents...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold">⚠️ Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => handleSuccess()}
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
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {userRole.toLowerCase() === "admin" && (
              <FormModal
                table="parent"
                type="create"
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table columns={columns} renderRow={renderRow} data={parents} />

      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ParentListPage;