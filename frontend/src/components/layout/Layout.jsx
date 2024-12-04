// Layout.jsx
import { Home, BookPlus, BarChart2, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", icon: <Home size={20} />, path: "/" },
    { name: "Log Entry", icon: <BookPlus size={20} />, path: "/log" },
    { name: "Analytics", icon: <BarChart2 size={20} />, path: "/analytics" },
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
    {
      name: "Logout",
      icon: <LogOut size={20} />,
      path: "#",
      onClick: handleLogout,
    },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-omori-white font-omori">
      <nav className="bg-omori-black text-omori-white sticky top-0 z-50 text-2xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="font-bold text-3xl tracking-wider">
              DREAMSCAPE MEMORY LODGER
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={link.onClick}
                  className={`flex items-center gap-2 px-4 py-2 transition-colors
        ${
          isActivePath(link.path)
            ? "bg-omori-red text-white"
            : "hover:bg-omori-red/20"
        }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-omori-red/20 rounded-lg"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={link.onClick}
                  className={`flex items-center gap-2 px-4 py-2 transition-colors
        ${
          isActivePath(link.path)
            ? "bg-omori-red text-white"
            : "hover:bg-omori-red/20"
        }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
};

export default Layout;
