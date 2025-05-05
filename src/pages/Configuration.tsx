import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getConfig, updateConfig, uploadAudioFile, ConfigData } from "@/services/api";
import { Settings, Save, Upload, Plus, Trash2, Music, Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { groupTimezones } from "@/utils/timezoneData";

const Configuration = () => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const groupedTimezones = groupTimezones();

  // Fetch configuration
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const configData = await getConfig(["TIMEZONE", "SOURCES", "DEFAULT_TIMETABLE", "SHORT_AZAN_FILE", "FAJR_AZAN_FILE", "REGULAR_AZAN_FILE"]);
        setConfig(configData);
      } catch (error) {
        console.error("Error fetching configuration:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Handle input change
  const handleInputChange = (key: string, value: string) => {
    if (!config) return;
    
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value
      };
    });
  };

  // Add new source
  const handleAddSource = () => {
    if (!sourceName || !sourceUrl || !config) return;
    
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        SOURCES: {
          ...prev.SOURCES,
          [sourceName]: sourceUrl
        }
      };
    });
    
    setSourceName("");
    setSourceUrl("");
    toast.success("Source added");
  };

  // Remove source
  const handleRemoveSource = (key: string) => {
    if (!config) return;
    
    setConfig(prev => {
      if (!prev) return prev;
      
      const newSources = { ...prev.SOURCES };
      delete newSources[key];
      
      // If we're removing the default timetable, reset it
      const newDefaultTimetable = 
        prev.DEFAULT_TIMETABLE === key && Object.keys(newSources).length > 0
          ? Object.keys(newSources)[0]
          : prev.DEFAULT_TIMETABLE;
      
      return {
        ...prev,
        SOURCES: newSources,
        DEFAULT_TIMETABLE: newDefaultTimetable
      };
    });
    
    toast.success("Source removed");
  };

  // Handle file upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAudioFile(file, fileType);
      
      // Update the config state with the new filename
      setConfig(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [fileType]: file.name
        };
      });
      
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    
    // Reset the input
    e.target.value = '';
  };

  // Save configuration
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!config) return;
    
    setSaving(true);
    try {
      await updateConfig(config);
      toast.success("Configuration saved successfully");
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-pulse flex flex-col items-center">
          <Settings className="animate-spin h-10 w-10 text-islamic-green mb-4" />
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-islamic-green" />
              System Configuration
            </CardTitle>
            <Button type="submit" disabled={saving || !config}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Settings */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={config?.TIMEZONE || "UTC"} 
                onValueChange={(value) => handleInputChange("TIMEZONE", value)}
              >
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {Object.entries(groupedTimezones).map(([region, zones]) => (
                    <SelectGroup key={region}>
                      <SelectLabel>{region}</SelectLabel>
                      {zones.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Sources Configuration */}
            <div>
              <h3 className="text-lg font-medium mb-4">Prayer Time Sources</h3>
              
              <div className="mb-6">
                <div className="flex items-end gap-4 mb-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="source_name">Source Name</Label>
                    <Input
                      id="source_name"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="e.g., dublin"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="source_url">Source URL</Label>
                    <Input
                      id="source_url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://example.com/api"
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleAddSource}
                    disabled={!sourceName || !sourceUrl}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                <div className="border rounded-md divide-y">
                  {config && Object.entries(config.SOURCES).map(([key, url]) => (
                    <div key={key} className="p-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{key}</h4>
                        <p className="text-sm text-muted-foreground truncate max-w-md">{url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          className={
                            config.DEFAULT_TIMETABLE === key 
                              ? "bg-islamic-green text-white hover:bg-islamic-green/90" 
                              : ""
                          }
                          onClick={() => handleInputChange("DEFAULT_TIMETABLE", key)}
                          type="button"
                        >
                          {config.DEFAULT_TIMETABLE === key ? "Default" : "Set as Default"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          type="button"
                          onClick={() => handleRemoveSource(key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Audio Files */}
            <div>
              <h3 className="text-lg font-medium mb-4">Audio Files</h3>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Short Azan</Label>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-2 text-islamic-green" />
                      <span className="text-sm truncate max-w-[100px]">
                        {config?.SHORT_AZAN_FILE || "Not set"}
                      </span>
                    </div>
                    <div>
                      <Label 
                        htmlFor="short_azan_upload" 
                        className="cursor-pointer px-3 py-2 bg-islamic-green text-white rounded-md text-xs flex items-center"
                      >
                        <Upload className="h-3 w-3 mr-1" /> Upload
                      </Label>
                      <Input
                        id="short_azan_upload"
                        type="file"
                        accept=".mp3"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "SHORT_AZAN_FILE")}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Fajr Azan</Label>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-2 text-islamic-blue" />
                      <span className="text-sm truncate max-w-[100px]">
                        {config?.FAJR_AZAN_FILE || "Not set"}
                      </span>
                    </div>
                    <div>
                      <Label 
                        htmlFor="fajr_azan_upload" 
                        className="cursor-pointer px-3 py-2 bg-islamic-blue text-white rounded-md text-xs flex items-center"
                      >
                        <Upload className="h-3 w-3 mr-1" /> Upload
                      </Label>
                      <Input
                        id="fajr_azan_upload"
                        type="file"
                        accept=".mp3"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "FAJR_AZAN_FILE")}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Regular Azan</Label>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-2 text-islamic-gold" />
                      <span className="text-sm truncate max-w-[100px]">
                        {config?.REGULAR_AZAN_FILE || "Not set"}
                      </span>
                    </div>
                    <div>
                      <Label 
                        htmlFor="regular_azan_upload" 
                        className="cursor-pointer px-3 py-2 bg-islamic-gold text-white rounded-md text-xs flex items-center"
                      >
                        <Upload className="h-3 w-3 mr-1" /> Upload
                      </Label>
                      <Input
                        id="regular_azan_upload"
                        type="file"
                        accept=".mp3"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "REGULAR_AZAN_FILE")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Configuration;
