import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Moon, Sun, User, Menu, X, BookOpen, PenTool, Users, GraduationCap, LogOut, LayoutDashboard, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const Navbar = ({ transparent = false }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success('Logged out successfully');
    setIsMobileMenuOpen(false);
  };

  const isDarkMode = theme === 'dark';

  const navLinks = [
    { name: 'Browse Courses', href: '/courses', icon: BookOpen },
    { name: 'Create Course', href: '/create-course', icon: GraduationCap },
    { name: 'Create Blog', href: '/blogform', icon: PenTool },
    { name: 'Find Teammates', href: '/find-teammates', icon: Users },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent && !isScrolled
          ? "bg-transparent"
          : isDarkMode
          ? "bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50"
          : "bg-white/80 backdrop-blur-lg border-b border-gray-200/50"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={`text-2xl font-bold transition-all duration-300 ${
              transparent && !isScrolled
                ? "text-white"
                : isDarkMode
                ? "text-white"
                : "text-gray-900"
            }`}
          >
            <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              SkillVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive(link.href)
                        ? isDarkMode
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-blue-600 text-white shadow-lg"
                        : transparent && !isScrolled
                        ? "text-white hover:bg-white/10"
                        : isDarkMode
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`rounded-full transition-all duration-300 ${
                transparent && !isScrolled
                  ? "text-white hover:bg-white/10"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            <AnimatePresence>
              {user ? (
                <motion.div
                  className="relative"
                  onMouseEnter={() => setIsProfileMenuOpen(true)}
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-all">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0).toUpperCase() : <User />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                  
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute right-0 mt-2 w-56 origin-top-right rounded-xl shadow-2xl p-2 z-50 ${
                          isDarkMode 
                            ? 'bg-gray-800/90 border border-gray-700/50 text-gray-200 backdrop-blur-md' 
                            : 'bg-white/90 border border-gray-200/50 text-gray-800 backdrop-blur-md'
                        }`}
                      >
                        <div className="p-2 border-b border-white/10">
                           <p className="font-semibold">{user.name}</p>
                           <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/dashboard" className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                          <Link to="/chat" className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            <span>Chat</span>
                          </Link>
                          <Link to={`/profile/${user._id}`} className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10">
                            <User className="mr-2 h-4 w-4" />
                            <span>View Profile</span>
                          </Link>
                        </div>
                        <div className={`my-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 text-red-400">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    asChild 
                    variant={transparent && !isScrolled ? "outline" : "ghost"}
                    className={`transition-all duration-300 ${
                      transparent && !isScrolled
                        ? "text-white border-white hover:bg-white/10"
                        : isDarkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Link to="/login" className="px-6">
                      Login
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    className={`transition-all duration-300 ${
                      transparent && !isScrolled
                        ? "bg-white text-blue-600 hover:bg-gray-100"
                        : isDarkMode
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                     <Link to="/register" className="px-6">
                        Sign up
                      </Link>
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`rounded-full transition-all duration-300 mr-2 ${
                transparent && !isScrolled
                  ? "text-white hover:bg-white/10"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`transition-all duration-300 ${
                transparent && !isScrolled
                  ? "text-white"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden overflow-hidden ${
              isDarkMode ? "bg-gray-900 border-t border-gray-700" : "bg-white border-t border-gray-200"
            }`}
          >
            <div className="px-6 pt-2 pb-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? "bg-blue-600 text-white"
                      : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              ))}
              <div className={`my-2 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                      isActive('/dashboard')
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                      isActive('/chat')
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Login
                  </Link>
                   <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-md text-base font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
