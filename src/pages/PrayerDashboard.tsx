
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  getPrayerTimes, 
  getAzanSwitches, 
  getShortAzanSwitches, 
  updateAzanSwitches, 
  updateShortAzanSwitches,
  startScheduler,
  stopScheduler,
  PrayerTimes,
  SwitchStatus
} from "@/services/api";
import { calculateNextPrayer } from "@/utils/timeUtils";
import { Clock, Volume2, Play, Square } from "lucide-react";

const PrayerDashboard = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [azanSwitches, setAzanSwitches] = useState<SwitchStatus | null>(null);
  const [shortAzanSwitches, setShortAzanSwitches] = useState<SwitchStatus | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [countdown, setCountdown] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch prayer times and switch statuses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [timesData, azanData, shortAzanData] = await Promise.all([
          getPrayerTimes(),
          getAzanSwitches(),
          getShortAzanSwitches()
        ]);
        
        setPrayerTimes(timesData);
        setAzanSwitches(azanData);
        setShortAzanSwitches(shortAzanData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCountdown = () => {
      const { nextPrayer: next, countdown: time } = calculateNextPrayer(prayerTimes);
      setNextPrayer(next);
      setCountdown(time);
    };

    // Update immediately
    updateCountdown();
    
    // Then update every second
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, [prayerTimes]);

  // Handle azan switch toggle
  const handleAzanToggle = async (prayer: string) => {
    if (!azanSwitches) return;
    
    const newSwitches = { ...azanSwitches };
    newSwitches[prayer] = azanSwitches[prayer] === "On" ? "Off" : "On";
    
    setAzanSwitches(newSwitches);
    await updateAzanSwitches(newSwitches);
  };

  // Handle short azan switch toggle
  const handleShortAzanToggle = async (prayer: string) => {
    if (!shortAzanSwitches) return;
    
    const newSwitches = { ...shortAzanSwitches };
    newSwitches[prayer] = shortAzanSwitches[prayer] === "On" ? "Off" : "On";
    
    setShortAzanSwitches(newSwitches);
    await updateShortAzanSwitches(newSwitches);
  };

  // Prayer times list
  const prayersList = prayerTimes ? Object.entries(prayerTimes).map(([prayer, time]) => ({
    name: prayer,
    time,
    isNext: prayer === nextPrayer,
    azanOn: azanSwitches ? azanSwitches[prayer] === "On" : false,
    shortAzanOn: shortAzanSwitches ? shortAzanSwitches[prayer] === "On" : false
  })) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Prayer Countdown */}
        <Card className="lg:col-span-3 bg-gradient-to-r from-islamic-green to-islamic-blue text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex items-center mb-4 lg:mb-0">
                <Clock size={40} />
                <div className="ml-4">
                  <h3 className="text-xl font-medium">Next Prayer</h3>
                  <p className="text-3xl font-bold">{nextPrayer || "Loading..."}</p>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-medium">Countdown</h3>
                <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                  <p className="text-4xl font-mono font-bold">{countdown || "00:00:00"}</p>
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0">
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => startScheduler()}
                    variant="outline" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/40"
                  >
                    <Play size={18} className="mr-2" /> Start Scheduler
                  </Button>
                  <Button 
                    onClick={() => stopScheduler()}
                    variant="outline" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/40"
                  >
                    <Square size={18} className="mr-2" /> Stop Scheduler
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Times */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Volume2 className="mr-2 h-5 w-5 text-islamic-green" />
              Prayer Times & Azan Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-pulse text-center">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Prayer</th>
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-center">Azan</th>
                      <th className="px-4 py-3 text-center">Short Azan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prayersList.map((prayer) => (
                      <tr 
                        key={prayer.name} 
                        className={`border-b hover:bg-muted/50 ${prayer.isNext ? 'bg-islamic-green/10' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {prayer.isNext && (
                              <span className="mr-2 size-2 rounded-full bg-islamic-green animate-pulse"></span>
                            )}
                            <span className={prayer.isNext ? "font-bold" : ""}>
                              {prayer.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">{prayer.time}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={prayer.azanOn}
                              onCheckedChange={() => handleAzanToggle(prayer.name)}
                              className="data-[state=checked]:bg-islamic-green"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={prayer.shortAzanOn}
                              onCheckedChange={() => handleShortAzanToggle(prayer.name)}
                              className="data-[state=checked]:bg-islamic-blue"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrayerDashboard;
