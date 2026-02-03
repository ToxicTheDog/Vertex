import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ProjectFormData {
  id?: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  deadline: string;
  team: number;
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectFormData | null;
  onSave: (data: ProjectFormData) => void;
  mode: 'create' | 'edit' | 'view';
}

const emptyProject: ProjectFormData = {
  name: '',
  description: '',
  status: 'active',
  progress: 0,
  deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  team: 1
};

const statusLabels = {
  'active': 'Aktivan',
  'completed': 'Završen',
  'on-hold': 'Na čekanju'
};

export const ProjectDialog = ({ open, onOpenChange, project, onSave, mode }: ProjectDialogProps) => {
  const [formData, setFormData] = useState<ProjectFormData>(emptyProject);

  useEffect(() => {
    if (project) {
      setFormData(project);
    } else {
      setFormData(emptyProject);
    }
  }, [project, open]);

  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const isViewMode = mode === 'view';
  const title = mode === 'create' ? 'Novi projekat' : mode === 'edit' ? 'Izmena projekta' : 'Detalji projekta';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Unesite podatke o novom projektu' : 
             mode === 'edit' ? 'Izmenite podatke o projektu' :
             'Pregled podataka o projektu'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Naziv projekta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isViewMode}
              placeholder="Unesite naziv projekta"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isViewMode}
              placeholder="Kratak opis projekta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as ProjectFormData['status'] })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Rok završetka</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Napredak: {formData.progress}%</Label>
            <Slider
              value={[formData.progress]}
              onValueChange={(v) => setFormData({ ...formData, progress: v[0] })}
              max={100}
              step={5}
              disabled={isViewMode}
              className="py-2"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="team">Broj članova tima</Label>
            <Input
              id="team"
              type="number"
              min={1}
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: parseInt(e.target.value) || 1 })}
              disabled={isViewMode}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isViewMode ? 'Zatvori' : 'Otkaži'}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {mode === 'create' ? 'Kreiraj' : 'Sačuvaj'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
