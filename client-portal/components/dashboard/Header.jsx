import {
  History,
  Plus,
  PlusIcon,
  PlusSquare,
  User,
  Bell,
  Settings,
} from "lucide-react";
import React from "react";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <div className="bg-white h-14 flex items-center justify-between px-8 border-b border-gray-200 shadow-sm">
      <div className="flex gap-4">
        {/* Recent Activities */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <History className="w-5 h-5 text-gray-600" />
        </button>
        {/* Search Bar */}
        <SearchBar />
      </div>
      <div className="flex items-center gap-2">
        {/* Plus Icon */}
        <div className="pr-3 border-r border-gray-200">
          <button className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">
            <Plus className="text-white w-5 h-5" />
          </button>
        </div>
        {/* Bell Icon */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        {/* Settings Icon */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        {/* User Icon */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <User className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
