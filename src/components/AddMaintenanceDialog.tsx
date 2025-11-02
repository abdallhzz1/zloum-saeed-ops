import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveSchedule } from '@/services/storage';
import { MaintenanceSchedule, RecurrenceType } from '@/types';
import { addDays, addWeeks, addMonths } from 'date-fns';

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

  const calculateNextDate = () => {
    const baseDate = nextDueDate ? new Date(nextDueDate) : new Date();
    switch (recurrence) {
      case 'Daily':
        return addDays(baseDate, 1).toISOString();
      case 'Weekly':
        return addWeeks(baseDate, 1).toISOString();
      case 'Monthly':
        return addMonths(baseDate, 1).toISOString();
      case 'Custom':
        return addDays(baseDate, parseInt(intervalDays) || 7).toISOString();
      default:
        return baseDate.toISOString();
    }
  };

  const handleSubmit = async () => {
    const schedule: MaintenanceSchedule = {
      id: existingSchedule?.id || Date.now().toString(),
      machineId,
      recurrence,
      intervalDays: recurrence === 'Custom' ? parseInt(intervalDays) : undefined,
      nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : new Date().toISOString(),
      createdAt: existingSchedule?.createdAt || new Date().toISOString(),
    };

    await saveSchedule(schedule);
    onScheduleSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingSchedule ? 'Edit' : 'Schedule'} Maintenance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="recurrence">Recurrence *</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
              <SelectTrigger id="recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrence === 'Custom' && (
            <div>
              <Label htmlFor="interval">Interval (days) *</Label>
              <Input
                id="interval"
                type="number"
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                min="1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="nextDue">Next Due Date *</Label>
            <Input
              id="nextDue"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!nextDueDate}>
            {existingSchedule ? 'Update' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
