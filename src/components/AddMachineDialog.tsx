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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Machine</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="machine-name">Machine Name *</Label>
            <Input
              id="machine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Generator A"
            />
          </div>
          <div>
            <Label htmlFor="machine-code">Machine Code *</Label>
            <Input
              id="machine-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., GEN-001"
            />
          </div>
          <div>
            <Label htmlFor="machine-state">Initial State</Label>
            <Select value={state} onValueChange={(v) => setState(v as MachineState)}>
              <SelectTrigger id="machine-state">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Working">Working</SelectItem>
                <SelectItem value="Stopped">Stopped</SelectItem>
                <SelectItem value="Needs Maintenance">Needs Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !code.trim()}>
            Add Machine
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
