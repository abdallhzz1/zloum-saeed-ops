import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveSchedule, getMachine } from '@/services/storage';
import { MaintenanceSchedule, RecurrenceType } from '@/types';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { scheduleRecurringNotification } from '@/services/notifications';
import { useToast } from '@/hooks/use-toast';

interface AddMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineId: string;
  existingSchedule: MaintenanceSchedule | null;
  onScheduleSaved: () => void;
}

export function AddMaintenanceDialog({
  open,
  onOpenChange,
  machineId,
  existingSchedule,
  onScheduleSaved,
}: AddMaintenanceDialogProps) {
  const { toast } = useToast();
  const [recurrence, setRecurrence] = useState<RecurrenceType>('Weekly');
  const [intervalDays, setIntervalDays] = useState('7');
  const [nextDueDate, setNextDueDate] = useState('');

  useEffect(() => {
    if (existingSchedule) {
      setRecurrence(existingSchedule.recurrence);
      setIntervalDays(existingSchedule.intervalDays?.toString() || '7');
      setNextDueDate(existingSchedule.nextDueDate.split('T')[0]);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setNextDueDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [existingSchedule, open]);

  const handleSubmit = async () => {
    try {
      const schedule: MaintenanceSchedule = {
        id: existingSchedule?.id || Date.now().toString(),
        machineId,
        recurrence,
        intervalDays: recurrence === 'Custom' ? parseInt(intervalDays) : undefined,
        nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : new Date().toISOString(),
        createdAt: existingSchedule?.createdAt || new Date().toISOString(),
      };

      await saveSchedule(schedule);

      // Schedule notification
      const machine = await getMachine(machineId);
      if (machine) {
        const notificationId = await scheduleRecurringNotification(schedule, machine.name);
        schedule.notificationId = notificationId;
        await saveSchedule(schedule);
      }

      toast({ title: existingSchedule ? 'تم تحديث الجدول' : 'تم جدولة الصيانة' });
      onScheduleSaved();
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: 'فشل جدولة الصيانة', 
        description: 'تأكد من تفعيل صلاحية الإشعارات',
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {existingSchedule ? 'تعديل' : 'جدولة'} الصيانة
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="recurrence" className="font-semibold">التكرار *</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
              <SelectTrigger id="recurrence" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">يومي</SelectItem>
                <SelectItem value="Weekly">أسبوعي</SelectItem>
                <SelectItem value="Monthly">شهري</SelectItem>
                <SelectItem value="Custom">مخصص</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrence === 'Custom' && (
            <div>
              <Label htmlFor="interval" className="font-semibold">الفاصل الزمني (أيام) *</Label>
              <Input
                id="interval"
                type="number"
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                min="1"
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label htmlFor="nextDue" className="font-semibold">الموعد القادم *</Label>
            <Input
              id="nextDue"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={!nextDueDate} className="btn-gradient">
            {existingSchedule ? 'تحديث' : 'جدولة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
