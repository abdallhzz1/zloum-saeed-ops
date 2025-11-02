import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Plus, Mic, Camera, FileText, Trash2, Calendar, FileDown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMachine, getNotes, getSchedules, saveMachine, saveMaintenanceEvent, deleteNote, saveNote, saveSchedule } from '@/services/storage';
import { Machine, Note, MaintenanceSchedule, MachineState } from '@/types';
import { AddTextNoteDialog } from '@/components/AddTextNoteDialog';
import { AddMaintenanceDialog } from '@/components/AddMaintenanceDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Camera as CapCamera, CameraResultType } from '@capacitor/camera';
import { useToast } from '@/hooks/use-toast';
import { generateMachineReportSimple } from '@/services/pdfSimple';
import { getNextMaintenanceDate } from '@/services/notifications';
import { startRecording, stopRecording } from '@/services/audio';

const stateInfo: Record<MachineState, { color: string; label: string; icon: string }> = {
  'Working': { color: 'badge-working', label: 'تعمل', icon: '✓' },
  'Stopped': { color: 'badge-stopped', label: 'متوقفة', icon: '✕' },
  'Needs Maintenance': { color: 'badge-maintenance', label: 'تحتاج صيانة', icon: '⚠' },
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
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const loadData = async () => {
    if (!machineId) return;
    setLoading(true);
    try {
      const [machineData, notesData, schedulesData] = await Promise.all([
        getMachine(machineId),
        getNotes(machineId),
        getSchedules(machineId),
      ]);
      setMachine(machineData);
      setNotes(notesData);
      setSchedule(schedulesData[0] || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [machineId]);

  const handleStateChange = async (newState: MachineState) => {
    if (!machine) return;
    const updated = { ...machine, state: newState };
    await saveMachine(updated);
    setMachine(updated);
    toast({ title: 'تم تحديث حالة الآلة' });
  };

  const handleTakePhoto = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
      });
      
      const note: Note = {
        id: Date.now().toString(),
        machineId: machineId!,
        type: 'image',
        content: image.dataUrl!,
        createdAt: new Date().toISOString(),
      };
      
      await saveNote(note);
      await loadData();
      toast({ title: 'تم إضافة الصورة بنجاح' });
    } catch (error) {
      toast({ title: 'فشل التقاط الصورة', variant: 'destructive' });
    }
  };

  const handleMarkMaintenanceDone = async () => {
    if (!machine || !schedule) return;
    
    try {
      await saveMaintenanceEvent({
        id: Date.now().toString(),
        machineId: machine.id,
        completedAt: new Date().toISOString(),
      });

      const updated = { ...machine, lastMaintenanceDate: new Date().toISOString() };
      await saveMachine(updated);

      const nextDate = getNextMaintenanceDate(schedule);
      const updatedSchedule = { ...schedule, nextDueDate: nextDate.toISOString() };
      await saveSchedule(updatedSchedule);

      await loadData();
      toast({ title: 'تم تسجيل الصيانة بنجاح' });
    } catch (error) {
      toast({ title: 'فشل تسجيل الصيانة', variant: 'destructive' });
    }
  };

  const handleGenerateReport = async () => {
    if (!machine) return;
    
    try {
      await generateMachineReportSimple(machine);
      toast({ title: 'تم إنشاء التقرير بنجاح' });
    } catch (error) {
      toast({ title: 'فشل إنشاء التقرير', variant: 'destructive' });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      await deleteNote(noteId);
      await loadData();
      toast({ title: 'تم حذف الملاحظة' });
    }
  };

  const handleStartAudioRecording = async () => {
    if (isRecording) {
      try {
        const audioData = await stopRecording();
        
        const note: Note = {
          id: Date.now().toString(),
          machineId: machineId!,
          type: 'audio',
          content: audioData,
          createdAt: new Date().toISOString(),
        };
        
        await saveNote(note);
        await loadData();
        setIsRecording(false);
        toast({ title: 'تم حفظ التسجيل الصوتي' });
      } catch (error) {
        toast({ title: 'فشل حفظ التسجيل', variant: 'destructive' });
        setIsRecording(false);
      }
    } else {
      try {
        await startRecording();
        setIsRecording(true);
        toast({ title: 'جاري التسجيل...' });
      } catch (error) {
        toast({ title: 'فشل بدء التسجيل', description: 'تأكد من صلاحيات الميكروفون', variant: 'destructive' });
      }
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

  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">الآلة غير موجودة</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="glass rounded-2xl p-4 md:p-6 animate-fade-in-scale">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 hover:bg-primary/10 rounded-lg"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                {machine.name}
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{machine.code}</p>
            </div>
            <Badge className={`${stateInfo[machine.state].color} text-xs px-2.5 py-1 shrink-0`}>
              {stateInfo[machine.state].icon} {stateInfo[machine.state].label}
            </Badge>
            <Button 
              onClick={handleGenerateReport} 
              size="icon"
              variant="outline" 
              className="h-10 w-10 hover:bg-primary/10 rounded-lg shrink-0"
              title="تصدير تقرير PDF"
            >
              <FileDown className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="glass animate-fade-in-scale stagger-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              حالة الآلة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">تحديث الحالة</label>
              <Select value={machine.state} onValueChange={(v) => handleStateChange(v as MachineState)}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Working">✓ تعمل</SelectItem>
                  <SelectItem value="Stopped">✕ متوقفة</SelectItem>
                  <SelectItem value="Needs Maintenance">⚠ تحتاج صيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {machine.lastMaintenanceDate && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                آخر صيانة: {format(new Date(machine.lastMaintenanceDate), 'PPP', { locale: ar })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Schedule Card */}
        <Card className="glass animate-fade-in-scale stagger-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              جدول الصيانة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schedule ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">التكرار</p>
                    <p className="font-semibold">
                      {schedule.recurrence === 'Daily' && 'يومي'}
                      {schedule.recurrence === 'Weekly' && 'أسبوعي'}
                      {schedule.recurrence === 'Monthly' && 'شهري'}
                      {schedule.recurrence === 'Custom' && `كل ${schedule.intervalDays} يوم`}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">الموعد القادم</p>
                    <p className="font-semibold">{format(new Date(schedule.nextDueDate), 'PP', { locale: ar })}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowMaintenanceDialog(true)} variant="outline" size="sm">
                    تعديل الجدول
                  </Button>
                  <Button onClick={handleMarkMaintenanceDone} size="sm" className="btn-gradient">
                    <CheckCircle className="h-4 w-4 ml-2" />
                    تم إجراء الصيانة
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowMaintenanceDialog(true)} className="btn-gradient">
                <Plus className="h-4 w-4 ml-2" />
                جدولة صيانة دورية
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card className="glass animate-fade-in-scale stagger-3">
          <CardHeader>
            <CardTitle>الملاحظات والتوثيق</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" dir="rtl">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">الكل ({notes.length})</TabsTrigger>
                <TabsTrigger value="text">نص ({notes.filter(n => n.type === 'text').length})</TabsTrigger>
                <TabsTrigger value="audio">صوت ({notes.filter(n => n.type === 'audio').length})</TabsTrigger>
                <TabsTrigger value="image">صور ({notes.filter(n => n.type === 'image').length})</TabsTrigger>
              </TabsList>

              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={() => setShowTextDialog(true)} 
                  size="icon"
                  className="h-10 w-10 btn-gradient rounded-lg"
                  title="ملاحظة نصية"
                >
                  <FileText className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleTakePhoto} 
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-lg"
                  title="التقاط صورة"
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleStartAudioRecording} 
                  size="icon"
                  variant={isRecording ? "destructive" : "outline"}
                  className={`h-10 w-10 rounded-lg ${isRecording ? "animate-pulse" : ""}`}
                  title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>

              <TabsContent value="all" className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id} className="glass hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {note.type === 'text' && <FileText className="h-3 w-3" />}
                          {note.type === 'image' && <Camera className="h-3 w-3" />}
                          {note.type === 'audio' && <Mic className="h-3 w-3" />}
                          {format(new Date(note.createdAt), 'PPp', { locale: ar })}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {note.type === 'text' && <p className="text-sm leading-relaxed">{note.content}</p>}
                      {note.type === 'image' && (
                        <img src={note.content} alt="ملاحظة" className="rounded-lg max-h-64 object-cover w-full" />
                      )}
                      {note.type === 'audio' && (
                        <audio controls className="w-full">
                          <source src={note.content} type="audio/webm" />
                        </audio>
                      )}
                      {note.description && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{note.description}</p>
                      )}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {notes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    لا توجد ملاحظات بعد. ابدأ بإضافة أول ملاحظة!
                  </p>
                )}
              </TabsContent>

              <TabsContent value="text" className="space-y-3">
                {notes.filter(n => n.type === 'text').map((note) => (
                  <Card key={note.id} className="glass">
                    <CardContent className="pt-4">
                      <p className="text-sm leading-relaxed mb-2">{note.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(note.createdAt), 'PPp', { locale: ar })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="image" className="grid grid-cols-2 gap-3">
                {notes.filter(n => n.type === 'image').map((note) => (
                  <Card key={note.id} className="glass overflow-hidden">
                    <img src={note.content} alt="ملاحظة" className="w-full h-48 object-cover" />
                    <CardContent className="p-2">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(note.createdAt), 'PP', { locale: ar })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="audio" className="space-y-3">
                {notes.filter(n => n.type === 'audio').map((note) => (
                  <Card key={note.id} className="glass">
                    <CardContent className="pt-4">
                      <audio controls className="w-full mb-2">
                        <source src={note.content} type="audio/webm" />
                      </audio>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(note.createdAt), 'PPp', { locale: ar })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
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
