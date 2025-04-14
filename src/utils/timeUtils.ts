
export function calculateNextPrayer(prayerTimes: { [key: string]: string }): {
  nextPrayer: string;
  countdown: string;
  timeRemaining: number;
} {
  const prayers = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const now = new Date();
  
  // Convert prayer times to Date objects for today
  const prayerDateObjects: { [key: string]: Date } = {};
  
  for (const prayer of prayers) {
    if (prayerTimes[prayer]) {
      const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
      
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);
      
      prayerDateObjects[prayer] = prayerDate;
    }
  }

  // Find the next prayer
  let nextPrayer = "";
  let minDiff = Infinity;

  for (const prayer of prayers) {
    if (prayerDateObjects[prayer]) {
      const timeDiff = prayerDateObjects[prayer].getTime() - now.getTime();
      
      // If the prayer time is in the future and closer than the current next prayer
      if (timeDiff > 0 && timeDiff < minDiff) {
        minDiff = timeDiff;
        nextPrayer = prayer;
      }
    }
  }

  // If no future prayer is found for today, the next prayer is Fajr tomorrow
  if (!nextPrayer) {
    nextPrayer = "Fajr";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(
      parseInt(prayerTimes["Fajr"].split(":")[0], 10),
      parseInt(prayerTimes["Fajr"].split(":")[1], 10),
      0,
      0
    );
    minDiff = tomorrow.getTime() - now.getTime();
  }

  // Format the countdown
  const hours = Math.floor(minDiff / (1000 * 60 * 60));
  const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((minDiff % (1000 * 60)) / 1000);

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return {
    nextPrayer,
    countdown: `${formattedHours}:${formattedMinutes}:${formattedSeconds}`,
    timeRemaining: minDiff,
  };
}
