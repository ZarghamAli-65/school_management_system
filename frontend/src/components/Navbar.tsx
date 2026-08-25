import Link from "next/link";
import Image from "next/image";

import { getCurrentUser } from "@/lib/api/user.api";
import LogoutButton from "./auth/LogoutButton";
import { NotificationProvider } from "./NotificationProvider";
import SearchBar from "./SearchBar";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center justify-between p-4">
      <SearchBar />

      <div className="flex items-center gap-6">
        {/* Messages */}
        <Link
          href="/list/messages"
          className="bg-white rounded-full w-7 flex items-center justify-center hover:bg-gray-100 transition"
        >
          <Image
            src="/message.png"
            alt="Messages"
            width={20}
            height={20}
          />
        </Link>

        {/* Announcements */}
        <Link
          href="/list/announcements"
          className="bg-white rounded-full w-7 flex items-center justify-center hover:bg-gray-100 transition relative"
        >
          <Image
            src="/announcement.png"
            alt="Announcements"
            width={20}
            height={20}
          />
        </Link>

        {/* User */}
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.name || "Guest"}
          </span>

          <span className="text-[10px] text-gray-500">
            {user?.role || ""}
          </span>
        </div>

        {/* Logout */}
        <NotificationProvider>
          <div className="flex flex-col">
            <span className="text-xs leading-3 font-medium">
              <LogoutButton />
            </span>
          </div>
        </NotificationProvider>
      </div>
    </div>
  );
}