import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Settings, Factory, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSections, getMachines, getSchedules, getSettings, loadDemoData } from '@/services/storage';
import { Section, Machine, MaintenanceSchedule } from '@/types';
import { AddSectionDialog } from '@/components/AddSectionDialog';
import { isBefore, parseISO } from 'date-fns';

export default function Sections() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const settings = await getSettings();
      
      // Load demo data if not loaded yet
      if (!settings.demoDataLoaded) {
        await loadDemoData();
      }

      const [sectionsData, machinesData, schedulesData] = await Promise.all([
        getSections(),
        getMachines(),
        getSchedules(),
      ]);
      
      setSections(sectionsData);
      setMachines(machinesData);
      setSchedules(schedulesData);

      // Calculate overdue maintenance
      const now = new Date();
      const overdue = schedulesData.filter(s => isBefore(parseISO(s.nextDueDate), now));
      setOverdueCount(overdue.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMachineCount = (sectionId: string) => {
    return machines.filter(m => m.sectionId === sectionId).length;
  };

  const getNeedsMaintenanceCount = (sectionId: string) => {
    return machines.filter(m => m.sectionId === sectionId && m.state === 'Needs Maintenance').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in-scale">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Factory className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  مصنع ظلوم وسعيد
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  نظام إدارة الصيانة والعمليات
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/settings')} 
              variant="outline"
              className="hover:bg-primary/10 hover:border-primary transition-all duration-300"
            >
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </Button>
          </div>
        </div>

        {/* Alert */}
        {overdueCount > 0 && (
          <Alert variant="destructive" className="animate-pulse-glow border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-semibold">
              يوجد {overdueCount} عملية صيانة متأخرة تحتاج إلى اهتمام فوري!
            </AlertDescription>
          </Alert>
        )}

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sections.map((section, index) => {
            const machineCount = getMachineCount(section.id);
            const needsMaintenance = getNeedsMaintenanceCount(section.id);

            return (
              <Card
                key={section.id}
                className={`card-hover cursor-pointer glass animate-fade-in-scale stagger-${(index % 5) + 1}`}
                onClick={() => navigate(`/section/${section.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl">
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {section.name}
                    </span>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Factory className="h-5 w-5 text-primary" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-bold text-primary">
                        {machineCount}
                      </div>
                      <span className="text-muted-foreground">آلة</span>
                    </div>
                    {needsMaintenance > 0 && (
                      <div className="badge-maintenance px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {needsMaintenance} تحتاج صيانة
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-20 glass rounded-2xl">
            <Factory className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold text-muted-foreground mb-2">لا توجد أقسام بعد</p>
            <p className="text-muted-foreground mb-6">ابدأ بإضافة قسم جديد للمصنع</p>
            <Button onClick={() => setShowAddDialog(true)} className="btn-gradient">
              <Plus className="h-4 w-4 ml-2" />
              إضافة قسم جديد
            </Button>
          </div>
        )}

        {/* FAB */}
        <button
          className="fab"
          onClick={() => setShowAddDialog(true)}
          aria-label="إضافة قسم جديد"
        >
          <Plus className="h-7 w-7" />
        </button>

        <AddSectionDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSectionAdded={loadData}
        />
      </div>
    </div>
  );
}
