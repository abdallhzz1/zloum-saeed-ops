import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSections, getMachines } from '@/services/storage';
import { Section, Machine, MachineState } from '@/types';
import { AddMachineDialog } from '@/components/AddMachineDialog';
import { format } from 'date-fns';

const stateColors: Record<MachineState, string> = {
  'Working': 'bg-green-500',
  'Stopped': 'bg-red-500',
  'Needs Maintenance': 'bg-yellow-500',
};

export default function Department() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const loadData = async () => {
    if (!sectionId) return;
    const [sectionsData, machinesData] = await Promise.all([
      getSections(),
      getMachines(sectionId),
    ]);
    setSection(sectionsData.find(s => s.id === sectionId) || null);
    setMachines(machinesData);
  };

  useEffect(() => {
    loadData();
  }, [sectionId]);

  if (!section) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{section.name}</h1>
            {section.description && (
              <p className="text-muted-foreground">{section.description}</p>
            )}
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Machine
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => (
            <Card
              key={machine.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/machine/${machine.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{machine.name}</CardTitle>
                  <Badge variant="outline" className={stateColors[machine.state]}>
                    {machine.state}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Code: {machine.code}</p>
              </CardHeader>
              <CardContent>
                {machine.lastMaintenanceDate && (
                  <p className="text-xs text-muted-foreground">
                    Last maintenance: {format(new Date(machine.lastMaintenanceDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {machines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No machines yet. Add your first machine!</p>
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
