import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowRight, FileDown, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSections, getMachines, getNotes, getMaintenanceEvents } from '@/services/storage';
import { Section, Machine, MachineState } from '@/types';
import { AddMachineDialog } from '@/components/AddMachineDialog';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { generateSectionReportSimple } from '@/services/pdfSimple';
import { useToast } from '@/hooks/use-toast';
import { subMonths } from 'date-fns';

const stateInfo: Record<MachineState, { color: string; label: string; icon: string }> = {
  'Working': { color: 'badge-working', label: 'تعمل', icon: '✓' },
  'Stopped': { color: 'badge-stopped', label: 'متوقفة', icon: '✕' },
  'Needs Maintenance': { color: 'badge-maintenance', label: 'تحتاج صيانة', icon: '⚠' },
};

export default function Department() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [section, setSection] = useState<Section | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!sectionId) return;
    setLoading(true);
    try {
      const [sectionsData, machinesData] = await Promise.all([
        getSections(),
        getMachines(sectionId),
      ]);
      setSection(sectionsData.find(s => s.id === sectionId) || null);
      setMachines(machinesData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sectionId]);

  const handleGenerateReport = async () => {
    if (!section) return;
    
    try {
      await generateSectionReportSimple(section, machines.length);
      toast({ title: 'تم إنشاء التقرير بنجاح' });
    } catch (error) {
      toast({ title: 'فشل إنشاء التقرير', variant: 'destructive' });
    }
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

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">القسم غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in-scale">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-primary/10 transition-all"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {section.name}
              </h1>
              {section.description && (
                <p className="text-muted-foreground mt-1">{section.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowAddDialog(true)} className="btn-gradient">
              <Plus className="h-4 w-4 ml-2" />
              إضافة آلة
            </Button>
            <Button onClick={handleGenerateReport} variant="outline" className="hover:bg-primary/10">
              <FileDown className="h-4 w-4 ml-2" />
              تصدير تقرير PDF
            </Button>
          </div>
        </div>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {machines.map((machine, index) => (
            <Card
              key={machine.id}
              className={`card-hover cursor-pointer glass animate-fade-in-scale stagger-${(index % 5) + 1}`}
              onClick={() => navigate(`/machine/${machine.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-bold">{machine.name}</CardTitle>
                  <Badge className={`${stateInfo[machine.state].color} text-xs`}>
                    {stateInfo[machine.state].icon} {stateInfo[machine.state].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {machine.code}
                </p>
              </CardHeader>
              <CardContent>
                {machine.lastMaintenanceDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Cog className="h-3 w-3" />
                    <span>
                      آخر صيانة: {format(new Date(machine.lastMaintenanceDate), 'PP', { locale: ar })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {machines.length === 0 && (
          <div className="text-center py-20 glass rounded-2xl">
            <Cog className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold text-muted-foreground mb-2">لا توجد آلات بعد</p>
            <p className="text-muted-foreground mb-6">أضف أول آلة في هذا القسم</p>
            <Button onClick={() => setShowAddDialog(true)} className="btn-gradient">
              <Plus className="h-4 w-4 ml-2" />
              إضافة آلة جديدة
            </Button>
          </div>
        )}

        <AddMachineDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          sectionId={sectionId!}
          onMachineAdded={loadData}
        />
      </div>
    </div>
  );
}
