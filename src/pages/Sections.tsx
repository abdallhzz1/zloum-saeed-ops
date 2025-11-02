import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSections, getMachines, getSchedules } from '@/services/storage';
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

  const loadData = async () => {
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Zloum & Saeed Factory</h1>
            <p className="text-muted-foreground mt-1">Maintenance & Operations</p>
          </div>
          <Button onClick={() => navigate('/settings')} variant="outline">
            Settings
          </Button>
        </div>

        {overdueCount > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {overdueCount} maintenance task{overdueCount > 1 ? 's are' : ' is'} overdue!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => {
            const machineCount = getMachineCount(section.id);
            const needsMaintenance = getNeedsMaintenanceCount(section.id);

            return (
              <Card
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/section/${section.id}`)}
              >
                <CardHeader>
                  <CardTitle>{section.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {section.description && (
                    <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{machineCount} machines</span>
                    {needsMaintenance > 0 && (
                      <span className="text-destructive font-medium">
                        {needsMaintenance} need maintenance
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>

        <AddSectionDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSectionAdded={loadData}
        />
      </div>
    </div>
  );
}
