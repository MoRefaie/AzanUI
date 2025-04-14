
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings2, 
  Upload, 
  Music, 
  Save,
  Link, 
  Edit2,
  Volume2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-islamic-green/10 rounded-lg">
          <Settings2 className="w-8 h-8 text-islamic-green" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-islamic-green to-islamic-blue bg-clip-text text-transparent">
          System Configuration
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Link className="w-6 h-6 text-islamic-green" />
              <span>Prayer APIs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">ICCI Source</Label>
                <div className="relative">
                  <Input 
                    value={configuration.sources.icci}
                    onChange={(e) => setConfiguration(prev => ({
                      ...prev, 
                      sources: { ...prev.sources, icci: e.target.value }
                    }))}
                    className="bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 focus-within:ring-islamic-green"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-hover:text-islamic-green transition-colors">
                    <Link className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="group">
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-300">Naas Source</Label>
                <div className="relative">
                  <Input 
                    value={configuration.sources.naas}
                    onChange={(e) => setConfiguration(prev => ({
                      ...prev, 
                      sources: { ...prev.sources, naas: e.target.value }
                    }))}
                    className="bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 focus-within:ring-islamic-green"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-hover:text-islamic-green transition-colors">
                    <Link className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Edit2 className="w-4 h-4 text-islamic-green" />
                <span>Default Timetable</span>
              </Label>
              <select 
                value={configuration.defaultTimetable}
                onChange={(e) => setConfiguration(prev => ({
                  ...prev, 
                  defaultTimetable: e.target.value
                }))}
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-sm focus:ring-islamic-green"
              >
                <option value="icci">ICCI</option>
                <option value="naas">Naas</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Music className="w-6 h-6 text-islamic-green" />
              <span>Audio Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <Label className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-islamic-green" />
                <span>Audio Volume</span>
              </Label>
              <Input 
                type="number"
                value={configuration.audioVolume}
                onChange={(e) => setConfiguration(prev => ({
                  ...prev, 
                  audioVolume: Number(e.target.value)
                }))}
                className="w-24 bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 focus:ring-islamic-green"
                min={0}
                max={100}
              />
            </div>
            <div className="grid gap-4">
              {[
                { label: "Short Azan", key: "shortAzanFile", icon: Music },
                { label: "Fajr Azan", key: "fajrAzanFile", icon: Music },
                { label: "Regular Azan", key: "regularAzanFile", icon: Music }
              ].map(({ label, key, icon: Icon }) => (
                <div key={key} className="group space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <Icon className="w-4 h-4 text-islamic-green" />
                    <span>{label}</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={configuration[key]}
                      readOnly
                      className="bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 focus:ring-islamic-green flex-grow"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="border-slate-200 dark:border-slate-700 hover:bg-islamic-green hover:text-white transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleConfigUpdate} 
          className="bg-islamic-green hover:bg-islamic-green/90 text-white px-6"
        >
          <Save className="mr-2 w-5 h-5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Configuration;
