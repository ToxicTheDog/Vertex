import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, FolderKanban, Calendar, Users, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  deadline: string;
  team: number;
}

const projects: Project[] = [
  {
    id: '1',
    name: 'Implementacija ERP sistema',
    description: 'Uvođenje novog ERP sistema u kompaniju',
    status: 'active',
    progress: 65,
    deadline: '2024-06-30',
    team: 5
  },
  {
    id: '2',
    name: 'Digitalizacija arhive',
    description: 'Skeniranje i digitalizacija papirne dokumentacije',
    status: 'active',
    progress: 40,
    deadline: '2024-04-15',
    team: 3
  },
  {
    id: '3',
    name: 'Optimizacija procesa nabavke',
    description: 'Poboljšanje efikasnosti nabavnog lanca',
    status: 'on-hold',
    progress: 25,
    deadline: '2024-05-01',
    team: 4
  },
  {
    id: '4',
    name: 'Obuka zaposlenih',
    description: 'Program obuke za nove sisteme',
    status: 'completed',
    progress: 100,
    deadline: '2024-01-31',
    team: 8
  }
];

const statusColors = {
  'active': 'bg-success/20 text-success',
  'completed': 'bg-primary/20 text-primary',
  'on-hold': 'bg-warning/20 text-warning'
};

const statusLabels = {
  'active': 'Aktivan',
  'completed': 'Završen',
  'on-hold': 'Na čekanju'
};

const Projects = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projekti</h1>
          <p className="text-muted-foreground">Upravljanje projektima i kampanjama</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novi projekat
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={`mt-1 ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Prikaži detalje</DropdownMenuItem>
                    <DropdownMenuItem>Izmeni</DropdownMenuItem>
                    <DropdownMenuItem>Arhiviraj</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="mt-2">{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Napredak</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.deadline).toLocaleDateString('sr-RS')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.team} članova</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
