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
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            إضافة ملاحظة نصية
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="note-content" className="font-semibold">الملاحظة *</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب ملاحظتك هنا..."
              className="mt-2"
              rows={5}
            />
          </div>
          <div>
            <Label htmlFor="note-tags" className="font-semibold">الوسوم (مفصولة بفاصلة)</Label>
            <Input
              id="note-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="مثال: عاجل، تفتيش"
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim()} className="btn-gradient">
            إضافة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
