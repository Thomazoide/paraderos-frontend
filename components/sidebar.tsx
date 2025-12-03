"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, FileText, ClipboardList, Menu, X, LogOut, User, Users, Route } from "lucide-react";
import { UserType } from "@/types/entities";

interface SidebarProps {
  fullName: string;
  userType: UserType;
  onLogout: () => void;
}

export default function Sidebar({ fullName, userType, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const allMenuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["terreno", "jefatura", "oferente"] },
    { name: "Paraderos", href: "/paraderos", icon: MapPin, roles: ["terreno", "jefatura", "oferente"] },
    { name: "Registros", href: "/registros", icon: FileText, roles: ["jefatura", "oferente"] },
    { name: "Órdenes de Trabajo", href: "/ordenes", icon: ClipboardList, roles: ["terreno", "jefatura", "oferente"] },
    { name: "Usuarios", href: "/usuarios", icon: Users, roles: ["jefatura", "oferente"] },
    { name: "Rutas", href: "/rutas", icon: Route, roles: ["jefatura", "oferente"] }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userType));

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-auto md:flex md:flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-blue-600">
          <h1 className="text-xl font-bold text-white">Paraderos App</h1>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User size={20} className="text-blue-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate" title={fullName}>{fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{userType}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                `}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
