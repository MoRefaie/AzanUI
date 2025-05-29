import { toast } from "sonner";

// Define base API URL dynamically based on the current host
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

// Types for the API responses
export interface PrayerTimes {
  [key: string]: string; // e.g., "Fajr": "04:46"
}

export interface SwitchStatus {
  [key: string]: string; // e.g., "Fajr": "On"
}

export interface SchedulerStatus {
  active: boolean;
  last_run?: string;
  next_run?: string;
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
  ISHA_GAMA_SWITCH?: string; // Adding the missing property with optional flag
}

// Mock data for Gama status
let mockGamaStatus = { active: false };


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
      "date": "2023-10-01",
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

export async function updateConfig(updates: Partial<ConfigData>, returnOutput: boolean = false): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/update-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates: updates }),
    });

    if (!response.ok) {
      throw new Error(`Error updating configuration: ${response.statusText}`);
    }

    // Parse the API response
    const jsonResponse = await response.json();

    if (returnOutput) {
      // If the switch is "on", return the output
      return jsonResponse;
    } else {
      // If the switch is "off", display a toast notification
      toast.success("Configuration updated successfully");
    }
  } catch (error) {
    if (returnOutput) {
      // If the switch is "on", return the output
      return {"status":"error","error":error};
    } else {
      console.error("Failed to update configuration:", error);
      toast.error("Failed to update configuration");
      throw error; // Re-throw the error to handle it in the calling function
    }
  }
}

export async function getGamaStatus(): Promise<boolean> {
  try {
    const config = await getConfig(["ISHA_GAMA_SWITCH"]);
    const status = config["ISHA_GAMA_SWITCH"];

    // Return true if "On", false if "Off"
    return status === "On";
  } catch (error) {
    console.error("Failed to fetch Isha Gama switches:", error);
    toast.error("Failed to fetch Isha Gama switches");
    // Default to false in case of an error
    return false;
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

export async function updateGamaStatus(status: boolean): Promise<{ active: boolean }> {
  try {
    // Convert the boolean status to "On" or "Off"
    const statusValue = status ? "On" : "Off";

    // Use updateConfig to send the ISHA_GAMA_SWITCHES configuration
    const updateconfig = await updateConfig({ ISHA_GAMA_SWITCH: statusValue } as Partial<ConfigData>, true);

    if (updateconfig.status === "error") {
      console.error("Failed to update Isha Gama switch:", updateconfig.error);
      toast.error("Failed to update Isha Gama switch");
      throw updateconfig.error;
    } else if (updateconfig.status === "success") {
      // If the update was successful, show a success message
      toast.success("Isha Gama switch updated successfully");
    }

    // Return the updated status
    return { active: status };
  } catch (error) {
    console.error("Failed to update Isha Gama switch:", error);
    toast.error("Failed to update Isha Gama switch");
    throw error;
  }
}

export async function updateAzanSwitches(switches: SwitchStatus): Promise<void> {
  try {
    // Use updateConfig to send the AZAN_SWITCHES configuration
    const updateconfig = await updateConfig({ AZAN_SWITCHES: switches }, true);
    if (updateconfig.status === "error") {
      console.error("Failed to update azan switches:", updateconfig.error);
      toast.error("Failed to update azan switches");
      throw updateconfig.error;
    } else if (updateconfig.status === "success") {
    // If the update was successful, show a success message 
    toast.success("Azan switches updated successfully");
    }
  } catch (error) {
    console.error("Failed to update azan switches:", error);
    toast.error("Failed to update azan switches");
  }
}

export async function updateShortAzanSwitches(switches: SwitchStatus): Promise<void> {
  try {
    const updateconfig = await updateConfig({ SHORT_AZAN_SWITCHES: switches }, true);
    if (updateconfig.status === "error") {
      console.error("Failed to update Short azan switches:", updateconfig.error);
      toast.error("Failed to update Short azan switches");
      throw updateconfig.error;
    } else if (updateconfig.status === "success") {
    // If the update was successful, show a success message 
    toast.success("Short azan switches updated successfully");
    }
  } catch (error) {
    console.error("Failed to update short azan switches:", error);
    toast.error("Failed to update short azan switches");
  }
}

export async function updateDuaaSwitches(switches: SwitchStatus): Promise<void> {
  try {
    const updateconfig = await updateConfig({ DUAA_SWITCHES: switches }, true);
    if (updateconfig.status === "error") {
      console.error("Failed to update Duaa switches:", updateconfig.error);
      toast.error("Failed to update Duaa switches");
      throw updateconfig.error;
    } else if (updateconfig.status === "success") {
    // If the update was successful, show a success message 
    toast.success("Duaa switches updated successfully");
    }
  } catch (error) {
    console.error("Failed to update duaa switches:", error);
    toast.error("Failed to update duaa switches");
  }
}

export async function getSchedulerStatus(): Promise<SchedulerStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/scheduler-status`);
    if (!response.ok) {
      throw new Error(`Error fetching scheduler status: ${response.statusText}`);
    }
    
    const jsonResponse = await response.json();
    
    if (jsonResponse.status === "success" && jsonResponse.data) {
      return jsonResponse.data;
    } else {
      throw new Error("Invalid response format or missing data field");
    }
  } catch (error) {
    console.error("Failed to fetch scheduler status:", error);
    // Return mock data for development without showing an error toast
    // since we're using this in initialization and don't want to show too many errors
    return {
      active: false
    };
  }
}

export async function startScheduler(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/start-scheduler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error starting scheduler: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    if (jsonResponse.status === "success") {
      // Only show success message if the scheduler was started successfully
      toast.success("Prayer scheduler started successfully");
    } else if (jsonResponse.status === "error") {
      // Handle specific error messages from the backend
      toast.error(jsonResponse.message);
    }
  } catch (error) {
    console.error("Failed to start scheduler:", error);
    toast.error("Failed to start scheduler");
    throw error; // Re-throw to handle in the component
  }
}

export async function stopScheduler(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/stop-scheduler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error stopping scheduler: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    if (jsonResponse.status === "success") {
      // Only show success message if the scheduler was stopped successfully
      toast.success("Prayer scheduler stopped successfully");
    } else if (jsonResponse.status === "error") {
      // Handle specific error messages from the backend
      toast.error(jsonResponse.message);
    }
  } catch (error) {
    console.error("Failed to stop scheduler:", error);
    toast.error("Failed to stop scheduler");
    throw error; // Re-throw to handle in the component
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

export async function uploadAudioFile(file: File, fileType: string): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    
    const response = await fetch(`${API_BASE_URL}/update-audio`, {
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
