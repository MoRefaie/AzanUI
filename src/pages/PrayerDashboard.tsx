import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getPrayerTimes, 
  getAzanSwitches, 
  getShortAzanSwitches,
  getDuaaSwitches,
  updateAzanSwitches, 
  updateShortAzanSwitches,
  updateDuaaSwitches,
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  getGamaStatus,
  updateGamaStatus,
  PrayerTimes,
  SwitchStatus
} from "@/services/api";
import { calculateNextPrayer } from "@/utils/timeUtils";
import { Clock, Volume2, Play, Square, Moon, Sun, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const PrayerDashboard = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [azanSwitches, setAzanSwitches] = useState<SwitchStatus | null>(null);
  const [shortAzanSwitches, setShortAzanSwitches] = useState<SwitchStatus | null>(null);
  const [duaaSwitches, setDuaaSwitches] = useState<SwitchStatus | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [countdown, setCountdown] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [schedulerActive, setSchedulerActive] = useState<boolean>(false);
  const [schedulerStatusLoading, setSchedulerStatusLoading] = useState<boolean>(true);
  const [gamaActive, setGamaActive] = useState<boolean>(false);
  const [gamaStatusLoading, setGamaStatusLoading] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [timesData, azanData, shortAzanData, duaaData, schedulerStatus, gamaStatus] = await Promise.all([
        getPrayerTimes(),
        getAzanSwitches(),
        getShortAzanSwitches(),
        getDuaaSwitches(),
        getSchedulerStatus(),
        getGamaStatus()
      ]);
      
      setPrayerTimes(timesData);
      setAzanSwitches(azanData);
      setShortAzanSwitches(shortAzanData);
      setDuaaSwitches(duaaData);
      setSchedulerActive(schedulerStatus.active);
      setGamaActive(gamaStatus);
      setSchedulerStatusLoading(false);
      setGamaStatusLoading(false);
      
      // Set current date from prayer times API if available
      if (timesData && timesData.date) {
        setCurrentDate(timesData.date);
        
        // Format the date as "Wednesday, May 14, 2025"
        try {
          const dateObj = parseISO(timesData.date);
          setFormattedDate(format(dateObj, "EEEE, MMMM d, yyyy"));
        } catch (error) {
          // If parsing fails, use the original date
          setFormattedDate(timesData.date);
        }
      } else {
        // Fallback to current date
        const today = new Date();
        setCurrentDate(format(today, "yyyy-MM-dd"));
        setFormattedDate(format(today, "EEEE, MMMM d, yyyy"));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Using offline data - API server not available");
      setSchedulerStatusLoading(false);
      setGamaStatusLoading(false);
      
      // Fallback to current date
      const today = new Date();
      setCurrentDate(format(today, "yyyy-MM-dd"));
      setFormattedDate(format(today, "EEEE, MMMM d, yyyy"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // If we're in a Lovable environment, we'll retry every 20 seconds up to 3 times
    // This is useful for development if the API server comes online later
    if (retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 20000);
      
      return () => clearTimeout(timer);
    }
  }, [retryCount]);

  useEffect(() => {
    if (!prayerTimes) return;

    const updateCountdown = () => {
      const { nextPrayer: next, countdown: time, timeRemaining: remaining } = calculateNextPrayer(prayerTimes);
      setNextPrayer(next);
      setCountdown(time);
      setTimeRemaining(remaining);

      // If countdown reaches zero, refresh data
      if (remaining <= 1000) {
        fetchAllData();
      }
    };

    updateCountdown();
    
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, [prayerTimes]);

  const handleAzanToggle = async (prayer: string) => {
    if (!azanSwitches) return;
    
    const newSwitches = { ...azanSwitches };
    newSwitches[prayer] = azanSwitches[prayer] === "On" ? "Off" : "On";
    
    setAzanSwitches(newSwitches);
    await updateAzanSwitches(newSwitches);
  };

  const handleShortAzanToggle = async (prayer: string) => {
    if (!shortAzanSwitches) return;
    
    const newSwitches = { ...shortAzanSwitches };
    newSwitches[prayer] = shortAzanSwitches[prayer] === "On" ? "Off" : "On";
    
    setShortAzanSwitches(newSwitches);
    await updateShortAzanSwitches(newSwitches);
  };

  const handleDuaaToggle = async (prayer: string) => {
    if (!duaaSwitches) return;
    
    const newSwitches = { ...duaaSwitches };
    newSwitches[prayer] = duaaSwitches[prayer] === "On" ? "Off" : "On";
    
    setDuaaSwitches(newSwitches);
    await updateDuaaSwitches(newSwitches);
  };

  const handleSchedulerToggle = async () => {
    try {
      setSchedulerStatusLoading(true);
      if (schedulerActive) {
        await stopScheduler();
        setSchedulerActive(false);
        toast.success("Prayer scheduler stopped");
      } else {
        await startScheduler();
        setSchedulerActive(true);
        toast.success("Prayer scheduler started");
      }
    } catch (error) {
      toast.error(schedulerActive 
        ? "Failed to stop scheduler - API server not available" 
        : "Failed to start scheduler - API server not available");
    } finally {
      setSchedulerStatusLoading(false);
    }
  };

  const handleGamaToggle = async () => {
    try {
      setGamaStatusLoading(true);
      const newStatus = !gamaActive;
      await updateGamaStatus(newStatus);
      setGamaActive(newStatus);
      toast.success(newStatus ? "Isha Gama On" : "Isha Gama Off");
    } catch (error) {
      toast.error("Failed to update Isha Gama - API server not available");
    } finally {
      setGamaStatusLoading(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const renderPrayerRows = () => {
    if (loading && !prayerTimes) {
      return Array(6).fill(0).map((_, index) => (
        <tr key={`skeleton-${index}`} className="border-b border-islamic-green/10">
          <td className="px-3 md:px-6 py-3"><Skeleton className="h-6 w-20 md:w-32" /></td>
          <td className="px-3 md:px-6 py-3"><Skeleton className="h-6 w-12 md:w-16" /></td>
          <td className="px-3 md:px-6 py-3"><div className="flex justify-center"><Skeleton className="h-6 w-8 md:w-10 rounded-full" /></div></td>
          <td className="px-3 md:px-6 py-3"><div className="flex justify-center"><Skeleton className="h-6 w-8 md:w-10 rounded-full" /></div></td>
          <td className="px-3 md:px-6 py-3"><div className="flex justify-center"><Skeleton className="h-6 w-8 md:w-10 rounded-full" /></div></td>
        </tr>
      ));
    }

    if (!prayerTimes) return null;

    return Object.entries(prayerTimes).filter(([prayer]) => prayer !== 'date').map(([prayer, time]) => {
      const isNext = prayer === nextPrayer;
      const isIshaWithGama = prayer === "Isha" && gamaActive;
      const isAzanOff = azanSwitches?.[prayer] === "Off";
      const isDisabled = isAzanOff || isIshaWithGama;
      
      return (
        <tr 
          key={prayer} 
          className={`border-b border-islamic-green/10 transition-colors
            ${isNext ? 'bg-islamic-beige/30' : 'hover:bg-islamic-beige/20'}`}
        >
          <td className="px-2 md:px-4 py-2 md:py-3">
            <div className="flex items-center gap-1 md:gap-2">
              {prayer === "Fajr" && <Moon className="text-islamic-blue" size={16} />}
              {prayer === "Sunrise" && <Sun className="text-islamic-gold" size={16} />}
              {prayer === "Dhuhr" && <Sun className="text-islamic-gold" size={16} />}
              {prayer === "Asr" && <Sun className="text-islamic-gold" size={16} />}
              {prayer === "Maghrib" && <Sun className="text-islamic-gold" size={16} />}
              {prayer === "Isha" && <Moon className="text-islamic-blue" size={16} />}
              <span className={`${isNext ? "font-bold text-islamic-green text-sm md:text-base" : "text-sm md:text-base"}`}>
                {prayer}
              </span>
              {isNext && (
                <span className="inline-flex h-2 w-2 rounded-full bg-islamic-green animate-pulse" />
              )}
            </div>
          </td>
          <td className="px-2 md:px-4 py-2 md:py-3 font-mono text-sm md:text-base">
            {time}
          </td>
          {!isFullscreen && (
            <>
              <td className="px-1 md:px-3 py-2 md:py-3">
                <div className="flex justify-center">
                  <Switch
                    checked={azanSwitches?.[prayer] === "On"}
                    onCheckedChange={() => handleAzanToggle(prayer)}
                    colorScheme="islamic-green"
                    disabled={isIshaWithGama}
                    className="scale-75 md:scale-90"
                  />
                </div>
              </td>
              <td className="px-1 md:px-3 py-2 md:py-3">
                <div className="flex justify-center">
                  <Switch
                    checked={shortAzanSwitches?.[prayer] === "On"}
                    onCheckedChange={() => handleShortAzanToggle(prayer)}
                    colorScheme="islamic-blue"
                    disabled={isDisabled}
                    className="scale-75 md:scale-90"
                  />
                </div>
              </td>
              <td className="px-1 md:px-3 py-2 md:py-3">
                <div className="flex justify-center">
                  <Switch
                    checked={duaaSwitches?.[prayer] === "On"}
                    onCheckedChange={() => handleDuaaToggle(prayer)}
                    colorScheme="islamic-gold"
                    disabled={isDisabled}
                    className="scale-75 md:scale-90"
                  />
                </div>
              </td>
            </>
          )}
        </tr>
      );
    });
  };

  return (
    <div className="space-y-3 md:space-y-4 max-w-full lg:max-w-7xl mx-auto px-2 md:px-4">
      <Card className="bg-gradient-to-br from-islamic-green to-islamic-blue text-white overflow-hidden mt-2 md:mt-4">
        <CardContent className="p-3 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium mb-1">Next Prayer</h2>
              {loading && !nextPrayer ? (
                <Skeleton className="h-8 md:h-9 w-24 md:w-28 bg-white/20 mx-auto lg:mx-0" />
              ) : (
                <div className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">{nextPrayer || "Loading..."}</div>
              )}
            </div>
            
            <div className="text-center">
              <div className="flex flex-col items-center">
                <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium mb-1">Time Remaining</h2>
                <div className="bg-white/20 rounded-lg px-3 md:px-4 py-2 md:py-3 inline-block min-w-[140px] md:min-w-[180px]">
                  {loading && !countdown ? (
                    <Skeleton className="h-7 md:h-8 w-24 md:w-28 bg-white/20" />
                  ) : (
                    <p className="font-mono text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tabular-nums">
                      {countdown || "00:00:00"}
                    </p>
                  )}
                </div>
                <p className="text-sm md:text-base lg:text-lg xl:text-xl mt-1">{formattedDate}</p>
              </div>
            </div>
            
            {!isFullscreen && (
              <div className="text-center lg:text-right md:col-span-2 lg:col-span-1">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  <div className="flex flex-col items-center lg:items-end space-y-1">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-medium">Scheduler</h2>
                    <div className="flex items-center gap-2">
                      {schedulerStatusLoading ? (
                        <Skeleton className="h-6 w-12 bg-white/20" />
                      ) : (
                        <Switch
                          checked={schedulerActive}
                          onCheckedChange={handleSchedulerToggle}
                          className={`${schedulerActive ? 'bg-green-500' : 'bg-red-500'} data-[state=unchecked]:bg-red-500 scale-75 md:scale-90 lg:scale-100`}
                        />
                      )}
                      <span className="font-medium text-sm md:text-base lg:text-lg xl:text-xl">
                        {schedulerStatusLoading 
                          ? "Loading..." 
                          : schedulerActive 
                            ? "On" 
                            : "Off"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center lg:items-end space-y-1">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-medium">Isha Gama</h2>
                    <div className="flex items-center gap-2">
                      {gamaStatusLoading ? (
                        <Skeleton className="h-6 w-12 bg-white/20" />
                      ) : (
                        <Switch
                          checked={gamaActive}
                          onCheckedChange={handleGamaToggle}
                          className={`${gamaActive ? 'bg-green-500' : 'bg-red-500'} data-[state=unchecked]:bg-red-500 scale-75 md:scale-90 lg:scale-100`}
                        />
                      )}
                      <span className="font-medium text-sm md:text-base lg:text-lg xl:text-xl">
                        {gamaStatusLoading 
                          ? "Loading..." 
                          : gamaActive 
                            ? "On" 
                            : "Off"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-islamic-green/20 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
            <thead>
              <tr className="bg-islamic-beige/50">
                <th className="px-2 md:px-4 py-2 text-left font-semibold text-islamic-green text-sm md:text-base lg:text-lg xl:text-xl">Prayer</th>
                <th className="px-2 md:px-4 py-2 text-left font-semibold text-islamic-green text-sm md:text-base lg:text-lg xl:text-xl">Time</th>
                {!isFullscreen && (
                  <>
                    <th className="px-2 md:px-4 py-2 text-center font-semibold text-islamic-green text-sm md:text-base lg:text-lg xl:text-xl">Azan</th>
                    <th className="px-2 md:px-4 py-2 text-center font-semibold text-islamic-green text-sm md:text-base lg:text-lg xl:text-xl">
                      <span className="hidden md:inline">Short Azan</span>
                      <span className="md:hidden">Short</span>
                    </th>
                    <th className="px-2 md:px-4 py-2 text-center font-semibold text-islamic-green text-sm md:text-base lg:text-lg xl:text-xl">Duaa</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {renderPrayerRows()}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PrayerDashboard;
