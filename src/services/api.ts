import { toast } from "sonner";

// Define base API URL
const API_BASE_URL = "http://localhost:8000/api"; // Change this to your actual API URL

// Types for the API responses
export interface PrayerTimes {
  [key: string]: string; // e.g., "Fajr": "04:46"
}

export interface SwitchStatus {
  [key: string]: string; // e.g., "Fajr": "On"
}

export interface Device {
  name: string;
  address: string;
  mac: string;
  identifier: string;
  deep_sleep: boolean;
  device_info: string;
  ready: boolean;
  services: {
    protocol: string;
    port: number;
    credentials: null | string;
    requires_password: boolean;
    password: null | string;
    pairing: string;
  }[];
}

export interface DeviceResponse {
  status: string;
  data: {
    status: string;
    devices: Device[];
  };
}

export interface ConfigData {
  SOURCES: {
    [key: string]: string;
  };
  DEFAULT_TIMETABLE: string;
  TIMEZONE: string;
  AUDIO_VOLUME: string;
  SHORT_AZAN_FILE: string;
  FAJR_AZAN_FILE: string;
  REGULAR_AZAN_FILE: string;
  DEVICES: string[];
  AZAN_SWITCHES: SwitchStatus;
  SHORT_AZAN_SWITCHES: SwitchStatus;
  DUAA_SWITCHES: SwitchStatus;
}

// API call functions
export async function getPrayerTimes(): Promise<PrayerTimes> {
  try {
    const response = await fetch(`${API_BASE_URL}/prayer-times`);
    if (!response.ok) {
      throw new Error(`Error fetching prayer times: ${response.statusText}`);
    }

    // Parse the JSON response
    const jsonResponse = await response.json();

    // Extract the "data" field from the response
    if (jsonResponse.status === "success" && jsonResponse.data) {
      return jsonResponse.data;
    } else {
      throw new Error("Invalid response format or missing data field");
    }
  } catch (error) {
    console.error("Failed to fetch prayer times:", error);
    toast.error("Failed to fetch prayer times");

    // Return mock data for development
    return {
      "Fajr": "04:46",
      "Sunrise": "06:27",
      "Dhuhr": "13:27",
      "Asr": "17:14",
      "Maghrib": "20:24",
      "Isha": "21:59"
    };
  }
}


export async function getConfig(keys: string[]): Promise<ConfigData> {
  try {
    const response = await fetch(`${API_BASE_URL}/get-config`,{
      method: 'POST',
      headers: {
        "Content-Type": "application/json", // Ensure the request is sent as JSON
      },
      body: JSON.stringify({ list: keys }), // Send the keys in the "list" field
    });
    if (!response.ok) {
      throw new Error(`Error fetching configuration: ${response.statusText}`);
    }
    // Parse the JSON response
    const jsonResponse = await response.json();

    // Extract the "data" field from the response
    if (jsonResponse.status === "success" && jsonResponse.data) {
      return jsonResponse.data;
    } else {
      throw new Error("Invalid response format or missing data field");
    }
  } catch (error) {
    console.error("Failed to fetch configuration:", error);
    toast.error("Failed to fetch configuration");
    // Return mock data for development
    return {
      "SOURCES": {
        "icci": "https://islamireland.ie/api/timetable/",
        "naas": "https://mawaqit.net/en/m/-34"
      },
      "DEFAULT_TIMETABLE": "icci",
      "TIMEZONE": "Europe/Dublin",
      "AUDIO_VOLUME": "40.0",
      "SHORT_AZAN_FILE": "Short_Azan.mp3",
      "FAJR_AZAN_FILE": "Fajr_Azan.mp3",
      "REGULAR_AZAN_FILE": "Regular_Azan.mp3",
      "DEVICES": ["024203835863"],
      "AZAN_SWITCHES": {
        "Fajr": "On",
        "Sunrise": "On",
        "Dhuhr": "On",
        "Asr": "On",
        "Maghrib": "On",
        "Isha": "On"
      },
      "SHORT_AZAN_SWITCHES": {
        "Fajr": "On",
        "Sunrise": "On",
        "Dhuhr": "On",
        "Asr": "On",
        "Maghrib": "On",
        "Isha": "On"
      },
      "DUAA_SWITCHES": {
        "Fajr": "On",
        "Sunrise": "On",
        "Dhuhr": "On",
        "Asr": "On",
        "Maghrib": "On",
        "Isha": "On"
      }
    };
  }
}

export async function getAzanSwitches(): Promise<SwitchStatus> {
  try {
    const config = await getConfig(["AZAN_SWITCHES"]);
    return config["AZAN_SWITCHES"];
  } catch (error) {
    console.error("Failed to fetch Azan switches:", error);
    toast.error("Failed to fetch Azan switches");
    return {
      "Fajr": "Off",
      "Sunrise": "Off",
      "Dhuhr": "Off",
      "Asr": "Off",
      "Maghrib": "Off",
      "Isha": "On"
    };
  }
}

export async function getShortAzanSwitches(): Promise<SwitchStatus> {
  try {
    const config = await getConfig(["SHORT_AZAN_SWITCHES"]);
    return config["SHORT_AZAN_SWITCHES"];
  } catch (error) {
    console.error("Failed to fetch Short Azan switches:", error);
    toast.error("Failed to fetch Short Azan switches");
    return {
      "Fajr": "Off",
      "Sunrise": "Off",
      "Dhuhr": "Off",
      "Asr": "Off",
      "Maghrib": "Off",
      "Isha": "On"
    };
  }
}

export async function getDuaaSwitches(): Promise<SwitchStatus> {
  try {
    const config = await getConfig(["DUAA_SWITCHES"]);
    return config["DUAA_SWITCHES"];
  } catch (error) {
    console.error("Failed to fetch Duaa switches:", error);
    toast.error("Failed to fetch Duaa switches");
    return {
      "Fajr": "Off",
      "Sunrise": "Off",
      "Dhuhr": "Off",
      "Asr": "Off",
      "Maghrib": "Off",
      "Isha": "On"
    };
  }
}

export async function updateAzanSwitches(switches: SwitchStatus): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/update-azan-switches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(switches),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating azan switches: ${response.statusText}`);
    }
    
    toast.success("Azan switches updated successfully");
  } catch (error) {
    console.error("Failed to update azan switches:", error);
    toast.error("Failed to update azan switches");
  }
}

export async function updateShortAzanSwitches(switches: SwitchStatus): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/update-short-azan-switches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(switches),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating short azan switches: ${response.statusText}`);
    }
    
    toast.success("Short azan switches updated successfully");
  } catch (error) {
    console.error("Failed to update short azan switches:", error);
    toast.error("Failed to update short azan switches");
  }
}

export async function startScheduler(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/start-scheduler`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Error starting scheduler: ${response.statusText}`);
    }
    
    toast.success("Scheduler started successfully");
  } catch (error) {
    console.error("Failed to start scheduler:", error);
    toast.error("Failed to start scheduler");
  }
}

export async function stopScheduler(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/stop-scheduler`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Error stopping scheduler: ${response.statusText}`);
    }
    
    toast.success("Scheduler stopped successfully");
  } catch (error) {
    console.error("Failed to stop scheduler:", error);
    toast.error("Failed to stop scheduler");
  }
}

export async function scanDevices(): Promise<DeviceResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/scan-devices`);
    if (!response.ok) {
      throw new Error(`Error scanning devices: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to scan devices:", error);
    toast.error("Failed to scan devices");
    // Return mock data for development
    return {
      "status": "success",
      "data": {
        "status": "success",
        "devices": [
          {
            "name": "Nemo's MacBook Pro",
            "address": "10.10.1.108",
            "mac": "BA:80:EA:44:D7:10",
            "identifier": "BA80EA44D710",
            "deep_sleep": false,
            "device_info": "MacBookPro18,3, MacOS",
            "ready": true,
            "services": [
              {
                "protocol": "AirPlay",
                "port": 7000,
                "credentials": null,
                "requires_password": false,
                "password": null,
                "pairing": "Mandatory"
              },
              {
                "protocol": "RAOP",
                "port": 7000,
                "credentials": null,
                "requires_password": false,
                "password": null,
                "pairing": "Unsupported"
              }
            ]
          },
          {
            "name": "Nemo's HomePod",
            "address": "10.10.1.102",
            "mac": "02:42:03:83:58:63",
            "identifier": "024203835863",
            "deep_sleep": false,
            "device_info": "HomePod Mini, tvOS 18.4",
            "ready": true,
            "services": [
              {
                "protocol": "AirPlay",
                "port": 7000,
                "credentials": null,
                "requires_password": false,
                "password": null,
                "pairing": "NotNeeded"
              },
              {
                "protocol": "Companion",
                "port": 49156,
                "credentials": null,
                "requires_password": false,
                "password": null,
                "pairing": "Unsupported"
              },
              {
                "protocol": "RAOP",
                "port": 7000,
                "credentials": null,
                "requires_password": false,
                "password": null,
                "pairing": "NotNeeded"
              }
            ]
          }
        ]
      }
    };
  }
}

export async function updateConfig(config: Partial<ConfigData>): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/update-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating configuration: ${response.statusText}`);
    }
    
    toast.success("Configuration updated successfully");
  } catch (error) {
    console.error("Failed to update configuration:", error);
    toast.error("Failed to update configuration");
  }
}

export async function uploadAudioFile(file: File, fileType: string): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    
    const response = await fetch(`${API_BASE_URL}/upload-audio`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error uploading audio file: ${response.statusText}`);
    }
    
    toast.success(`${fileType} uploaded successfully`);
  } catch (error) {
    console.error(`Failed to upload ${fileType}:`, error);
    toast.error(`Failed to upload ${fileType}`);
  }
}

export async function updateDuaaSwitches(switches: SwitchStatus): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/update-duaa-switches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(switches),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating duaa switches: ${response.statusText}`);
    }
    
    toast.success("Duaa switches updated successfully");
  } catch (error) {
    console.error("Failed to update duaa switches:", error);
    toast.error("Failed to update duaa switches");
  }
}
