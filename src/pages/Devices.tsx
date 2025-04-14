
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { scanDevices, Device, getConfig, updateConfig, ConfigData } from "@/services/api";
import { Monitor, RefreshCw, Save } from "lucide-react";

const Devices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [config, setConfig] = useState<ConfigData | null>(null);

  // Fetch existing config
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const configData = await getConfig();
        setConfig(configData);
        setSelectedDevices(configData.DEVICES || []);
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Handle device scan
  const handleScan = async () => {
    setScanLoading(true);
    try {
      const response = await scanDevices();
      if (response.status === "success" && response.data.devices) {
        setDevices(response.data.devices);
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

  // Submit selected devices
  const handleSubmit = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      await updateConfig({
        ...config,
        DEVICES: selectedDevices
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
      <Card>
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
            {scanLoading ? 'Scanning...' : 'Scan Devices'}
          </Button>
        </CardHeader>
        <CardContent>
          {devices.length === 0 && !scanLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No devices found. Click "Scan Devices" to search for available devices.</p>
              <Button onClick={handleScan}>Scan Now</Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-muted-foreground">
                  {devices.length} {devices.length === 1 ? 'device' : 'devices'} found
                </p>
                <Button onClick={handleSubmit} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
              
              <div className="space-y-4">
                {scanLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-pulse flex flex-col items-center">
                      <RefreshCw className="animate-spin h-10 w-10 text-islamic-green mb-4" />
                      <p>Scanning for devices...</p>
                    </div>
                  </div>
                ) : (
                  devices.map((device) => (
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
                      <div className="text-sm text-right">
                        <div className={`mb-1 ${device.ready ? 'text-green-600' : 'text-red-600'}`}>
                          {device.ready ? 'Ready' : 'Not Ready'}
                        </div>
                        <div className="text-muted-foreground">
                          {device.services.map(service => service.protocol).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Devices;
