import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { scanDevices, Device, getConfig, updateConfig, ConfigData } from "@/services/api";
import { Monitor, RefreshCw, Save, Trash2, Plus, Volume2 } from "lucide-react";

const Devices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [configuredDevices, setConfiguredDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [audioVolume, setAudioVolume] = useState<string>("40.0");

  // Fetch existing config and load configured devices
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const configData = await getConfig(["DEVICES", "AUDIO_VOLUME"]);
        setConfig(configData);
        setSelectedDevices(configData.DEVICES || []);
        setAudioVolume(configData.AUDIO_VOLUME || "40.0");
        
        // Initial scan to get real device data
        const response = await scanDevices();
        if (response.status === "success" && response.data.devices) {
          const configuredDevs = response.data.devices.filter(
            device => configData.DEVICES.includes(device.identifier)
          );
          setConfiguredDevices(configuredDevs);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        toast.error("Failed to load devices");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Handle device scan - only show new devices
  const handleScan = async () => {
    setScanLoading(true);
    try {
      const response = await scanDevices();
      if (response.status === "success" && response.data.devices) {
        // Filter out devices that are already in the config
        const newDevices = response.data.devices.filter(
          device => !selectedDevices.includes(device.identifier)
        );
        setDevices(newDevices);
        toast.success("Device scan completed");
      } else {
        toast.error("Failed to scan devices");
      }
    } catch (error) {
      console.error("Error scanning devices:", error);
      toast.error("Error scanning devices");
    } finally {
      setScanLoading(false);
    }
  };

  // Handle checkbox change
  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  // Add a device from scan results to selected devices
  const handleAddDevice = (device: Device) => {
    if (!selectedDevices.includes(device.identifier)) {
      setSelectedDevices(prev => [...prev, device.identifier]);
      setConfiguredDevices(prev => [...prev, device]);
      setDevices(prev => prev.filter(d => d.identifier !== device.identifier));
      toast.success(`Added ${device.name}`);
    }
  };

  // Remove a device from configuration
  const handleRemoveDevice = (deviceId: string) => {
    setSelectedDevices(prev => prev.filter(id => id !== deviceId));
    const deviceToRemove = configuredDevices.find(d => d.identifier === deviceId);
    if (deviceToRemove) {
      setConfiguredDevices(prev => prev.filter(d => d.identifier !== deviceId));
      setDevices(prev => [deviceToRemove, ...prev]);
      toast.success(`Removed ${deviceToRemove.name}`);
    }
  };

  // Handle audio volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioVolume(e.target.value);
  };

  // Submit selected devices
  const handleSubmit = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      await updateConfig({
        ...config,
        DEVICES: selectedDevices,
        AUDIO_VOLUME: audioVolume
      });
      toast.success("Device configuration updated");
    } catch (error) {
      console.error("Error updating devices:", error);
      toast.error("Failed to update device configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Monitor className="mr-2 h-5 w-5 text-islamic-green" />
            Device Management
          </CardTitle>
          <Button 
            variant="outline" 
            onClick={handleScan} 
            disabled={scanLoading}
            className="text-islamic-green hover:text-islamic-green-light hover:border-islamic-green"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${scanLoading ? 'animate-spin' : ''}`} />
            {scanLoading ? 'Scanning...' : 'Scan for New Devices'}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Audio Volume Control */}
          <div className="mb-8 p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="h-5 w-5 text-islamic-green" />
              <h3 className="text-lg font-medium">Audio Volume</h3>
            </div>
            <div className="flex flex-col space-y-2 max-w-md">
              <Label htmlFor="audio_volume">Volume ({audioVolume}%)</Label>
              <Input
                id="audio_volume"
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={audioVolume}
                onChange={handleVolumeChange}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Configured Devices Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Configured Devices</h3>
            {loading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="animate-spin h-8 w-8 text-islamic-green" />
              </div>
            ) : configuredDevices.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center border rounded-md">
                No devices configured. Scan for devices to add them.
              </div>
            ) : (
              <div className="space-y-4">
                {configuredDevices.map((device) => (
                  <div 
                    key={device.identifier}
                    className="flex items-center justify-between p-4 rounded-md border hover:bg-muted/50"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`device-${device.identifier}`} 
                          checked={selectedDevices.includes(device.identifier)}
                          onCheckedChange={() => handleDeviceToggle(device.identifier)}
                        />
                        <label 
                          htmlFor={`device-${device.identifier}`}
                          className="text-lg font-medium cursor-pointer"
                        >
                          {device.name}
                        </label>
                      </div>
                      <div className="ml-6 text-sm text-muted-foreground mt-1">
                        <p>{device.device_info}</p>
                        <p>IP: {device.address} | MAC: {device.mac}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`mr-4 ${device.ready ? 'text-green-600' : 'text-red-600'}`}>
                        {device.ready ? 'Ready' : 'Not Ready'}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveDevice(device.identifier)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Devices Section */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-4">Available Devices</h3>
            
            {scanLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-pulse flex flex-col items-center">
                  <RefreshCw className="animate-spin h-10 w-10 text-islamic-green mb-4" />
                  <p>Scanning for devices...</p>
                </div>
              </div>
            ) : devices.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center border rounded-md">
                No new devices found. Click "Scan for New Devices" to search for available devices.
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div 
                    key={device.identifier}
                    className="flex items-center justify-between p-4 rounded-md border hover:bg-muted/50"
                  >
                    <div className="flex flex-col">
                      <div className="text-lg font-medium">
                        {device.name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>{device.device_info}</p>
                        <p>IP: {device.address} | MAC: {device.mac}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`${device.ready ? 'text-green-600' : 'text-red-600'}`}>
                        {device.ready ? 'Ready' : 'Not Ready'}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddDevice(device)}
                        className="text-islamic-green"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Save Configuration Button */}
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Devices;
