
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
  PrayerTimes,
  SwitchStatus
} from "@/services/api";
import { calculateNextPrayer } from "@/utils/timeUtils";
import { Clock, Volume2, Play, Square, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

const PrayerDashboard = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [azanSwitches, setAzanSwitches] = useState<SwitchStatus | null>(null);
  const [shortAzanSwitches, setShortAzanSwitches] = useState<SwitchStatus | null>(null);
  const [duaaSwitches, setDuaaSwitches] = useState<SwitchStatus | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [countdown, setCountdown] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [timesData, azanData, shortAzanData, duaaData] = await Promise.all([
          getPrayerTimes(),
          getAzanSwitches(),
          getShortAzanSwitches(),
          getDuaaSwitches()
        ]);
        
        setPrayerTimes(timesData);
        setAzanSwitches(azanData);
        setShortAzanSwitches(shortAzanData);
        setDuaaSwitches(duaaData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Let's be more graceful with errors, we're already using mock data in the API functions
        toast.error("Using offline data - API server not available");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
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
      const { nextPrayer: next, countdown: time } = calculateNextPrayer(prayerTimes);
      setNextPrayer(next);
      setCountdown(time);
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

  const handleStartScheduler = async () => {
    try {
      await startScheduler();
      toast.success("Prayer scheduler started");
    } catch (error) {
      toast.error("Failed to start scheduler - API server not available");
    }
  };

  const handleStopScheduler = async () => {
    try {
      await stopScheduler();
      toast.success("Prayer scheduler stopped");
    } catch (error) {
      toast.error("Failed to stop scheduler - API server not available");
    }
  };

  const renderPrayerRows = () => {
    if (loading && !prayerTimes) {
      return Array(6).fill(0).map((_, index) => (
        <tr key={`skeleton-${index}`} className="border-b border-islamic-green/10">
          <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
          <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
          <td className="px-6 py-4"><div className="flex justify-center"><Skeleton className="h-6 w-10 rounded-full" /></div></td>
          <td className="px-6 py-4"><div className="flex justify-center"><Skeleton className="h-6 w-10 rounded-full" /></div></td>
          <td className="px-6 py-4"><div className="flex justify-center"><Skeleton className="h-6 w-10 rounded-full" /></div></td>
        </tr>
      ));
    }

    if (!prayerTimes) return null;

    return Object.entries(prayerTimes).map(([prayer, time]) => {
      const isNext = prayer === nextPrayer;
      return (
        <tr 
          key={prayer} 
          className={`border-b border-islamic-green/10 transition-colors
            ${isNext ? 'bg-islamic-beige/30' : 'hover:bg-islamic-beige/20'}`}
        >
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              {prayer === "Fajr" && <Moon className="text-islamic-blue" size={20} />}
              {prayer === "Sunrise" && <Sun className="text-islamic-gold" size={20} />}
              {prayer === "Dhuhr" && <Sun className="text-islamic-gold" size={20} />}
              {prayer === "Asr" && <Sun className="text-islamic-gold" size={20} />}
              {prayer === "Maghrib" && <Sun className="text-islamic-gold" size={20} />}
              {prayer === "Isha" && <Moon className="text-islamic-blue" size={20} />}
              <span className={`${isNext ? "font-bold text-islamic-green" : ""}`}>
                {prayer}
              </span>
              {isNext && (
                <span className="inline-flex h-2 w-2 rounded-full bg-islamic-green animate-pulse" />
              )}
            </div>
          </td>
          <td className="px-6 py-4 font-mono">
            {time}
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-center">
              <Switch
                checked={azanSwitches?.[prayer] === "On"}
                onCheckedChange={() => handleAzanToggle(prayer)}
                className="data-[state=checked]:bg-islamic-green"
              />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-center">
              <Switch
                checked={shortAzanSwitches?.[prayer] === "On"}
                onCheckedChange={() => handleShortAzanToggle(prayer)}
                className="data-[state=checked]:bg-islamic-blue"
              />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-center">
              <Switch
                checked={duaaSwitches?.[prayer] === "On"}
                onCheckedChange={() => handleDuaaToggle(prayer)}
                className="data-[state=checked]:bg-islamic-gold"
              />
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="text-center py-8 space-y-2">
        <h1 className="text-4xl font-bold text-islamic-green">Prayer Times</h1>
        <p className="text-islamic-blue/80">Dublin, Ireland</p>
      </div>

      <Card className="bg-gradient-to-br from-islamic-green to-islamic-blue text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-medium mb-2">Next Prayer</h2>
              {loading && !nextPrayer ? (
                <Skeleton className="h-10 w-32 bg-white/20" />
              ) : (
                <div className="text-4xl font-bold">{nextPrayer || "Loading..."}</div>
              )}
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-medium mb-2">Time Remaining</h2>
              <div className="bg-white/20 rounded-lg px-6 py-4 inline-block min-w-[200px]">
                {loading && !countdown ? (
                  <Skeleton className="h-10 w-32 bg-white/20" />
                ) : (
                  <p className="font-mono text-4xl font-bold tabular-nums">
                    {countdown || "00:00:00"}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-center lg:text-right space-y-3">
              <Button 
                onClick={handleStartScheduler}
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/40 mr-2"
              >
                <Play size={18} className="mr-2" /> Start
              </Button>
              <Button 
                onClick={handleStopScheduler}
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/40"
              >
                <Square size={18} className="mr-2" /> Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-islamic-green/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-islamic-beige/50">
                <th className="px-6 py-4 text-left font-semibold text-islamic-green">Prayer</th>
                <th className="px-6 py-4 text-left font-semibold text-islamic-green">Time</th>
                <th className="px-6 py-4 text-center font-semibold text-islamic-green">Azan</th>
                <th className="px-6 py-4 text-center font-semibold text-islamic-green">Short Azan</th>
                <th className="px-6 py-4 text-center font-semibold text-islamic-green">Duaa</th>
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
