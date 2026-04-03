import { useState } from 'react';
import { Plus, CheckSquare, Circle, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_ENDPOINTS } from '@/config/api';
import { clientsApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Poslati fakture za januar', completed: false, priority: 'high', dueDate: '2024-02-01' },
  { id: '2', title: 'Obračun zarada', completed: false, priority: 'high', dueDate: '2024-02-05' },
  { id: '3', title: 'Naručiti kancelarijski materijal', completed: true, priority: 'low' },
  { id: '4', title: 'Sastanak sa računovodstvom', completed: false, priority: 'medium', dueDate: '2024-02-10' },
  { id: '5', title: 'Ažurirati cenovnik', completed: true, priority: 'medium' },
  { id: '6', title: 'Popis zaliha', completed: false, priority: 'medium', dueDate: '2024-02-15' }
];

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive'
};

const priorityLabels = {
  low: 'Nizak',
  medium: 'Srednji',
  high: 'Visok'
};

const Tasks = () => {
  const { data: tasks, setData: setTasks } = useFetchData(() => clientsApi.getAll(), initialTasks);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority: 'medium'
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zadaci</h1>
          <p className="text-muted-foreground">Upravljanje zadacima i to-do listom</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupno zadataka</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktivni</p>
                <p className="text-2xl font-bold">{activeTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <Circle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Završeni</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Dodaj novi zadatak..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <Button onClick={addTask}>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj
              </Button>
            </div>
            <Select value={filter} onValueChange={(v: 'all' | 'active' | 'completed') => setFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi</SelectItem>
                <SelectItem value="active">Aktivni</SelectItem>
                <SelectItem value="completed">Završeni</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nema zadataka</p>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    task.completed ? 'bg-muted/50 opacity-60' : 'bg-card'
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-sm text-muted-foreground">
                        Rok: {new Date(task.dueDate).toLocaleDateString('sr-RS')}
                      </p>
                    )}
                  </div>
                  <Badge className={priorityColors[task.priority]}>
                    {priorityLabels[task.priority]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;
