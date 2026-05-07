import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, MessageSquare, Send, Users, BarChart3 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { campaignsApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms';
  status: 'draft' | 'active' | 'completed' | 'scheduled';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  date: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success/20 text-success',
  completed: 'bg-primary/20 text-primary',
  scheduled: 'bg-warning/20 text-warning'
};

const statusLabels: Record<string, string> = {
  draft: 'Nacrt',
  active: 'Aktivna',
  completed: 'Zavrsena',
  scheduled: 'Zakazana'
};

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('sr-RS');
};

const Campaigns = () => {
  const { data: campaigns } = useFetchData<Campaign[]>(() => campaignsApi.getAll(), []);
  const totalSent = campaigns.reduce((sum, campaign) => sum + (Number(campaign.sent) || 0), 0);
  const totalOpened = campaigns.reduce((sum, campaign) => sum + (Number(campaign.opened) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email i SMS kampanje</h1>
          <p className="text-muted-foreground">Marketing kampanje i komunikacija</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova kampanja
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupno kampanja</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <Send className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Poslato poruka</p>
                <p className="text-2xl font-bold">{totalSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Otvoreno</p>
                <p className="text-2xl font-bold">{totalOpened}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-full">
                <Users className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stopa otvaranja</p>
                <p className="text-2xl font-bold">
                  {totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sve kampanje</CardTitle>
          <CardDescription>Pregled svih marketing kampanja</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Primaoci</TableHead>
                <TableHead className="text-center">Poslato</TableHead>
                <TableHead className="text-center">Otvoreno</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id} className="data-table-row">
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    {campaign.type === 'email' ? (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>SMS</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[campaign.status] || statusColors.draft}>
                      {statusLabels[campaign.status] || campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{campaign.recipients || 0}</TableCell>
                  <TableCell className="text-center">{campaign.sent || 0}</TableCell>
                  <TableCell className="text-center">{campaign.type === 'email' ? campaign.opened || 0 : '-'}</TableCell>
                  <TableCell>{formatDate(campaign.date)}</TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nema kampanja za prikaz.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Campaigns;
