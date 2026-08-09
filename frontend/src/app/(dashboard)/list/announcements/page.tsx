"use client";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getAnnouncements } from "@/lib/api";
import { role } from "@/lib/data";
import Image from "next/image";
import { useEffect, useState } from "react";

type Announcement = {
  id: number;
  title: string;
  description: string;
  classId?: number | null;
  class?: {
    id: number;
    name: string;
  } | null;
  publishDate: string;
};

const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Description",
    accessor: "description",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const AnnouncementListPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const data = await getAnnouncements();

      setAnnouncements(data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const renderRow = (item: Announcement) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 font-semibold">
        {item.title}
      </td>

      <td className="p-4">
        <p className="max-w-xs truncate">
          {item.description}
        </p>
      </td>

      <td className="hidden md:table-cell">
        {item.class?.name || "All Classes"}
      </td>

      <td className="hidden md:table-cell">
        {new Date(item.publishDate).toLocaleDateString()}
      </td>

      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                table="announcement"
                type="update"
                data={item}
                onSuccess={fetchAnnouncements}
              />

              <FormModal
                table="announcement"
                type="delete"
                id={item.id}
                onSuccess={fetchAnnouncements}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
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
                table="announcement"
                type="create"
                onSuccess={fetchAnnouncements}
              />
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="p-4">
          Loading announcements...
        </p>
      ) : (
        <Table
          columns={columns}
          renderRow={renderRow}
          data={announcements}
        />
      )}

      <Pagination />
    </div>
  );
};

export default AnnouncementListPage;