"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SearchBar() {
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = e.currentTarget.value.trim();
      if (query) {
        router.push(`/list/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-500 px-2">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        className="w-[200px] p-2 bg-transparent outline-none"
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}