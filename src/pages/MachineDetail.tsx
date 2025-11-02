import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Mic, Camera, FileText, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMachine, getNotes, getSchedules, saveMachine } from '@/services/storage';
import { Machine, Note, MaintenanceSchedule, MachineState } from '@/types';
import { AddTextNoteDialog } from '@/components/AddTextNoteDialog';
import { AddMaintenanceDialog } from '@/components/AddMaintenanceDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Camera as CapCamera, CameraResultType } from '@capacitor/camera';
import { useToast } from '@/hooks/use-toast';

const stateColors: Record<MachineState, string> = {
  'Working': 'bg-green-500',
  'Stopped': 'bg-red-500',
  'Needs Maintenance': 'bg-yellow-500',
};

export default function MachineDetail() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [schedule, setSchedule] = useState<MaintenanceSchedule | null>(null);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  const loadData = async () => {
    if (!machineId) return;
    const [machineData, notesData, schedulesData] = await Promise.all([
      getMachine(machineId),
      getNotes(machineId),
      getSchedules(machineId),
    ]);
    setMachine(machineData);
    setNotes(notesData);
    setSchedule(schedulesData[0] || null);
  };

  useEffect(() => {
    loadData();
  }, [machineId]);

  const handleStateChange = async (newState: MachineState) => {
    if (!machine) return;
    const updated = { ...machine, state: newState };
    await saveMachine(updated);
    setMachine(updated);
    toast({ title: 'Machine state updated' });
  };

  const handleTakePhoto = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
      });
      
      // Save image note
      const note: Note = {
        id: Date.now().toString(),
        machineId: machineId!,
        type: 'image',
        content: image.dataUrl!,
        createdAt: new Date().toISOString(),
      };
      
      await import('@/services/storage').then(({ saveNote }) => saveNote(note));
      await loadData();
      toast({ title: 'Photo added successfully' });
    } catch (error) {
      toast({ title: 'Failed to take photo', variant: 'destructive' });
    }
  };

  if (!machine) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{machine.name}</h1>
            <p className="text-muted-foreground">Code: {machine.code}</p>
          </div>
          <Badge className={stateColors[machine.state]}>
            {machine.state}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Machine Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Update State</label>
              <Select value={machine.state} onValueChange={(v) => handleStateChange(v as MachineState)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Working">Working</SelectItem>
                  <SelectItem value="Stopped">Stopped</SelectItem>
                  <SelectItem value="Needs Maintenance">Needs Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {machine.lastMaintenanceDate && (
              <p className="text-sm text-muted-foreground">
                Last maintenance: {format(new Date(machine.lastMaintenanceDate), 'PPP')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {schedule ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Recurrence:</span> {schedule.recurrence}
                  {schedule.intervalDays && ` (every ${schedule.intervalDays} days)`}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Next due:</span> {format(new Date(schedule.nextDueDate), 'PPP')}
                </p>
                <Button onClick={() => setShowMaintenanceDialog(true)} variant="outline" size="sm">
                  Edit Schedule
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowMaintenanceDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => setShowTextDialog(true)} size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Text Note
                </Button>
                <Button onClick={handleTakePhoto} size="sm" variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button size="sm" variant="outline" disabled>
                  <Mic className="h-4 w-4 mr-2" />
                  Audio (Coming Soon)
                </Button>
              </div>

              <TabsContent value="all" className="space-y-3 mt-4">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="pt-4">
                      {note.type === 'text' && <p className="text-sm">{note.content}</p>}
                      {note.type === 'image' && (
                        <img src={note.content} alt="Machine note" className="rounded-lg max-h-48 object-cover" />
                      )}
                      {note.description && (
                        <p className="text-xs text-muted-foreground mt-2">{note.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(note.createdAt), 'PPP p')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {notes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No notes yet</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AddTextNoteDialog
          open={showTextDialog}
          onOpenChange={setShowTextDialog}
          machineId={machineId!}
          onNoteAdded={loadData}
        />

        <AddMaintenanceDialog
          open={showMaintenanceDialog}
          onOpenChange={setShowMaintenanceDialog}
          machineId={machineId!}
          existingSchedule={schedule}
          onScheduleSaved={loadData}
        />
      </div>
    </div>
  );
}
