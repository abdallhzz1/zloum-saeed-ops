import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveMachine } from '@/services/storage';
import { Machine, MachineState } from '@/types';

interface AddMachineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  onMachineAdded: () => void;
}

export function AddMachineDialog({ open, onOpenChange, sectionId, onMachineAdded }: AddMachineDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [state, setState] = useState<MachineState>('Working');

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) return;

    const machine: Machine = {
      id: Date.now().toString(),
      sectionId,
      name: name.trim(),
      code: code.trim(),
      state,
      createdAt: new Date().toISOString(),
    };

    await saveMachine(machine);
    onMachineAdded();
    setName('');
    setCode('');
    setState('Working');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            إضافة آلة جديدة
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="machine-name" className="font-semibold">اسم الآلة *</Label>
            <Input
              id="machine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مولد كهربائي A"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="machine-code" className="font-semibold">كود الآلة *</Label>
            <Input
              id="machine-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: GEN-001"
              className="mt-2 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="machine-state" className="font-semibold">الحالة الأولية</Label>
            <Select value={state} onValueChange={(v) => setState(v as MachineState)}>
              <SelectTrigger id="machine-state" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Working">تعمل</SelectItem>
                <SelectItem value="Stopped">متوقفة</SelectItem>
                <SelectItem value="Needs Maintenance">تحتاج صيانة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !code.trim()} className="btn-gradient">
            إضافة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
