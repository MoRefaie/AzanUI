import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Moon, Sun, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { getConfig } from "@/services/api"; // added for default timetable

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<string>("auto");
  const isMobile = useIsMobile();
  const [location, setLocation] = useState<string>("Dublin, Ireland");
  const [isLocked, setIsLocked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverAreaRef = useRef<HTMLDivElement>(null);

  // configuration state
  const [defaultTimetable, setDefaultTimetable] = useState<string>("");

  // Get current route
  const routerLocation = useLocation();
  const isPrayerDashboard = routerLocation.pathname === "/" || routerLocation.pathname === "/prayerdashboard";

  // fetch default timetable once
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cfg = await getConfig(["DEFAULT_TIMETABLE"]);
        if (cfg && cfg.DEFAULT_TIMETABLE) {
          setDefaultTimetable(cfg.DEFAULT_TIMETABLE);
        }
      } catch (e) {
        console.error("Failed to load config in MainLayout", e);
      }
    };
    fetchConfig();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsLocked(!isLocked);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Fullscreen toggle handler
  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events to update state
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).msFullscreenElement
        )
      );
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("msfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("msfullscreenchange", handleChange);
    };
  }, []);

  // Handle mouse enter and leave for hover functionality
  const handleMouseEnter = () => {
    if (!isLocked) {
      setIsHovering(true);
      setIsSidebarOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked) {
      setIsHovering(false);
      setIsSidebarOpen(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen && sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
        setIsLocked(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <div className={`min-h-screen flex w-full ${isDarkMode ? 'dark' : ''}`}>
      {/* Hide sidebar if fullscreen and on PrayerDashboard */}
      {!(isFullscreen && isPrayerDashboard) && (
        <div ref={sidebarRef}>
          <Sidebar 
            isOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar}
            isLocked={isLocked}
          />
        </div>
      )}
      
      {/* Hover area on the left edge of the screen */}
      {!isFullscreen && (
        <div 
          ref={hoverAreaRef}
          className="fixed left-0 top-0 h-full w-4 z-30"
          onMouseEnter={handleMouseEnter}
          onTouchStart={isMobile ? handleMouseEnter : undefined}
        />
      )}
      
      <div 
        className="flex-1 flex flex-col h-screen overflow-hidden"
        onMouseLeave={handleMouseLeave}
      >
        <header className="bg-white dark:bg-gray-800 shadow-md px-4 py-2 flex justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
          <div className="flex flex-col items-center flex-grow">
            <h1 className="relative text-2xl sm:text-3xl md:text-4xl font-bold text-islamic-green dark:text-islamic-green-light tracking-wide">
              Prayer Times
              {defaultTimetable && defaultTimetable.toLowerCase() !== "default" && (
                <span className="absolute left-full top-0 ml-2 text-lg font-bold text-islamic-green-light">
                  ({defaultTimetable})
                </span>
              )}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-islamic-blue/90 font-medium">
              {location}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {/* Show fullscreen toggle only on PrayerDashboard */}
            {isPrayerDashboard && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreenToggle}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto islamic-pattern bg-opacity-5 p-2 md:p-3 lg:p-4">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default MainLayout;
