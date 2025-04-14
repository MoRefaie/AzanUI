
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Upload, 
  Music, 
  Save, 
  CloudUpload, 
  Edit, 
  CheckCircle 
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Configuration = () => {
  const [configuration, setConfiguration] = useState({
    sources: {
      icci: "https://islamireland.ie/api/timetable/",
      naas: "https://mawaqit.net/en/m/-34"
    },
    defaultTimetable: "icci",
    timezone: "Europe/Dublin",
    audioVolume: 40.0,
    shortAzanFile: "Short_Azan.mp3",
    fajrAzanFile: "Fajr_Azan.mp3",
    regularAzanFile: "Regular_Azan.mp3"
  });

  const handleConfigUpdate = () => {
    // Future API call to update configuration
    console.log("Updating configuration:", configuration);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="flex items-center space-x-4 mb-6">
        <Settings className="w-10 h-10 text-purple-600" />
        <h1 className="text-3xl font-bold text-purple-800">Configuration</h1>
      </div>

      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="w-6 h-6 text-purple-500" />
            <span>Prayer Source Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ICCI Source</Label>
              <Input 
                value={configuration.sources.icci}
                onChange={(e) => setConfiguration(prev => ({
                  ...prev, 
                  sources: { ...prev.sources, icci: e.target.value }
                }))}
                className="bg-white border-purple-200 focus:ring-purple-300"
              />
            </div>
            <div>
              <Label>Naas Source</Label>
              <Input 
                value={configuration.sources.naas}
                onChange={(e) => setConfiguration(prev => ({
                  ...prev, 
                  sources: { ...prev.sources, naas: e.target.value }
                }))}
                className="bg-white border-purple-200 focus:ring-purple-300"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-purple-500" />
              <span>Default Timetable</span>
            </Label>
            <select 
              value={configuration.defaultTimetable}
              onChange={(e) => setConfiguration(prev => ({
                ...prev, 
                defaultTimetable: e.target.value
              }))}
              className="rounded-md border border-purple-200 px-2 py-1"
            >
              <option value="icci">ICCI</option>
              <option value="naas">Naas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudUpload className="w-6 h-6 text-purple-500" />
            <span>Audio Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Audio Volume</Label>
            <Input 
              type="number"
              value={configuration.audioVolume}
              onChange={(e) => setConfiguration(prev => ({
                ...prev, 
                audioVolume: Number(e.target.value)
              }))}
              className="w-24 bg-white border-purple-200 focus:ring-purple-300"
              min={0}
              max={100}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Short Azan", key: "shortAzanFile" },
              { label: "Fajr Azan", key: "fajrAzanFile" },
              { label: "Regular Azan", key: "regularAzanFile" }
            ].map(({ label, key }) => (
              <div key={key} className="space-y-2">
                <Label>{label} File</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={configuration[key]}
                    readOnly
                    className="bg-white border-purple-200 flex-grow"
                  />
                  <Button variant="outline" size="icon" className="border-purple-300">
                    <Upload className="w-4 h-4 text-purple-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleConfigUpdate} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Save className="mr-2 w-5 h-5" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default Configuration;

