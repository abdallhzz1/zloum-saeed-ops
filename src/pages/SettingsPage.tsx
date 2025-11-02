import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Bell, BellOff, Database, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getSettings, saveSettings, loadDemoData, clearAllData } from '@/services/storage';
import { Settings } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    notificationsEnabled: true,
    darkMode: false,
    demoDataLoaded: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
    if (data.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    await saveSettings(updated);
    setSettings(updated);

    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    toast({ title: 'Settings updated' });
  };

  const handleLoadDemo = async () => {
    await loadDemoData();
    toast({ title: 'Demo data loaded successfully' });
    navigate('/');
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      await clearAllData();
      toast({ title: 'All data cleared' });
      navigate('/');
    }
  };

  const handleExport = async () => {
    const data = {
      sections: localStorage.getItem('factory_sections'),
      machines: localStorage.getItem('factory_machines'),
      notes: localStorage.getItem('factory_notes'),
      schedules: localStorage.getItem('factory_schedules'),
      events: localStorage.getItem('factory_events'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory-backup-${Date.now()}.json`;
    a.click();
    toast({ title: 'Data exported successfully' });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(v) => updateSetting('darkMode', v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage maintenance reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-muted-foreground">Get maintenance reminders</p>
                </div>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(v) => updateSetting('notificationsEnabled', v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your factory data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleLoadDemo} variant="outline" className="w-full justify-start">
              <Database className="h-4 w-4 mr-2" />
              Load Demo Data
            </Button>
            <Button onClick={handleExport} variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Backup
            </Button>
            <Button onClick={handleClearData} variant="destructive" className="w-full justify-start">
              <Database className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
