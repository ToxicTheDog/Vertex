import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Mail, MessageSquare, FileText, Bell, Percent, Zap } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { apiService } from '@/services/apiService';

const AutomationSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automatizacija</h1>
          <p className="text-muted-foreground">Podešavanje automatskih procesa</p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Sačuvaj podešavanja
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Automatsko slanje faktura
            </CardTitle>
            <CardDescription>Automatski šaljite fakture klijentima</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-send">Omogući automatsko slanje</Label>
              <Switch id="auto-send" />
            </div>
            <div className="space-y-2">
              <Label>Vreme slanja</Label>
              <Input type="time" defaultValue="09:00" />
            </div>
            <div className="space-y-2">
              <Label>Email predmet</Label>
              <Input defaultValue="Nova faktura - {broj_fakture}" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Email/SMS podsetnici
            </CardTitle>
            <CardDescription>Podsetnici za dospele fakture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminders">Omogući podsetnike</Label>
              <Switch id="reminders" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Broj dana pre dospeća</Label>
              <Input type="number" defaultValue="3" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms">Pošalji i SMS</Label>
              <Switch id="sms" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Automatski izveštaji
            </CardTitle>
            <CardDescription>Generisanje periodičnih izveštaja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-report">Dnevni izveštaj</Label>
              <Switch id="daily-report" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-report">Nedeljni izveštaj</Label>
              <Switch id="weekly-report" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="monthly-report">Mesečni izveštaj</Label>
              <Switch id="monthly-report" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Email za izveštaje</Label>
              <Input type="email" defaultValue="izvestaji@firma.rs" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Obračun PDV i kamata
            </CardTitle>
            <CardDescription>Automatski obračuni</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-vat">Automatski PDV obračun</Label>
              <Switch id="auto-vat" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-interest">Automatska kamata za kašnjenje</Label>
              <Switch id="auto-interest" />
            </div>
            <div className="space-y-2">
              <Label>Kamatna stopa (%)</Label>
              <Input type="number" step="0.1" defaultValue="0.05" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Upozorenja za zalihe
            </CardTitle>
            <CardDescription>Notifikacije za niske zalihe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="stock-alerts">Omogući upozorenja</Label>
              <Switch id="stock-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-stock">Email notifikacije</Label>
              <Switch id="email-stock" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-stock">Push notifikacije</Label>
              <Switch id="push-stock" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto ponude i predračuni
            </CardTitle>
            <CardDescription>Automatsko generisanje dokumenata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-quotes">Automatske ponude</Label>
              <Switch id="auto-quotes" />
            </div>
            <div className="space-y-2">
              <Label>Rok važenja ponude (dani)</Label>
              <Input type="number" defaultValue="30" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="convert-proforma">Auto konverzija predračuna</Label>
              <Switch id="convert-proforma" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomationSettings;
