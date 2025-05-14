
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Moon, Sun, Smartphone, Tablet, Tv, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPrayerTimes } from "@/services/api";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<string>("auto");
  const isMobile = useIsMobile();
  const [location, setLocation] = useState<string>("Dublin, Ireland");
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Show layout icon based on current device or selected layout
  const getLayoutIcon = () => {
    switch(currentLayout) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      case "tv":
        return <Tv className="h-5 w-5" />;
      default:
        return <Maximize2 className="h-5 w-5" />;
    }
  };

  return (
    <div className={`min-h-screen flex w-full ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-md px-4 py-3 flex justify-between items-center">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-islamic-green dark:text-islamic-green-light tracking-wide">
              Prayer Times
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-islamic-blue/90 font-medium">
              {location}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 overflow-y-auto islamic-pattern bg-opacity-5">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default MainLayout;
