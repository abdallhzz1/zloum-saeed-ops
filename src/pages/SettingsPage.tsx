import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun, Bell, BellOff, Database, Download, Upload, Trash2 } from 'lucide-react';
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

    toast({ title: 'تم تحديث الإعدادات' });
  };

  const handleLoadDemo = async () => {
    await loadDemoData();
    toast({ title: 'تم تحميل البيانات التجريبية بنجاح' });
    navigate('/');
  };

  const handleClearData = async () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await clearAllData();
      toast({ title: 'تم حذف جميع البيانات' });
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
    toast({ title: 'تم تصدير البيانات بنجاح' });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="glass rounded-2xl p-4 md:p-6 animate-fade-in-scale">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="h-10 w-10 hover:bg-primary/10 rounded-lg"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              الإعدادات
            </h1>
          </div>
        </div>

        <Card className="glass animate-fade-in-scale stagger-1">
          <CardHeader>
            <CardTitle>المظهر</CardTitle>
            <CardDescription>تخصيص شكل التطبيق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <div>
                  <p className="font-semibold">الوضع الداكن</p>
                  <p className="text-sm text-muted-foreground">تفعيل الثيم الداكن</p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(v) => updateSetting('darkMode', v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass animate-fade-in-scale stagger-2">
          <CardHeader>
            <CardTitle>الإشعارات</CardTitle>
            <CardDescription>إدارة تنبيهات الصيانة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.notificationsEnabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <p className="font-semibold">تفعيل الإشعارات</p>
                  <p className="text-sm text-muted-foreground">استقبال تذكيرات الصيانة</p>
                </div>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(v) => updateSetting('notificationsEnabled', v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass animate-fade-in-scale stagger-3">
          <CardHeader>
            <CardTitle>إدارة البيانات</CardTitle>
            <CardDescription>نسخ احتياطي وإدارة بيانات المصنع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleLoadDemo} variant="outline" className="w-full justify-start hover:bg-primary/10">
              <Database className="h-4 w-4 ml-2" />
              تحميل بيانات تجريبية
            </Button>
            <Button onClick={handleExport} variant="outline" className="w-full justify-start hover:bg-primary/10">
              <Download className="h-4 w-4 ml-2" />
              تصدير نسخة احتياطية
            </Button>
            <Button onClick={handleClearData} variant="destructive" className="w-full justify-start">
              <Trash2 className="h-4 w-4 ml-2" />
              حذف جميع البيانات
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
