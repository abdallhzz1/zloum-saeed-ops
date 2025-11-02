import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { saveNote } from '@/services/storage';
import { Note } from '@/types';

interface AddTextNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineId: string;
  onNoteAdded: () => void;
}

export function AddTextNoteDialog({ open, onOpenChange, machineId, onNoteAdded }: AddTextNoteDialogProps) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      machineId,
      type: 'text',
      content: content.trim(),
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      createdAt: new Date().toISOString(),
    };

    await saveNote(note);
    onNoteAdded();
    setContent('');
    setTags('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Text Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="note-content">Note *</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your note here..."
              rows={5}
            />
          </div>
          <div>
            <Label htmlFor="note-tags">Tags (comma separated)</Label>
            <Input
              id="note-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., urgent, inspection"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
