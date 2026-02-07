import { AlertTriangle, FileX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'warning' | 'empty' | 'error';
  onRetry?: () => void;
  showRetry?: boolean;
}

export function EmptyState({
  title = 'Trenutno nema podataka',
  description = 'Nema dostupnih podataka za prikaz.',
  icon = 'empty',
  onRetry,
  showRetry = true
}: EmptyStateProps) {
  const IconComponent = icon === 'warning' 
    ? AlertTriangle 
    : icon === 'error' 
    ? AlertTriangle 
    : FileX;

  const iconColor = icon === 'warning' 
    ? 'text-yellow-500' 
    : icon === 'error' 
    ? 'text-destructive' 
    : 'text-muted-foreground';

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className={`mb-4 rounded-full bg-muted p-4 ${iconColor}`}>
          <IconComponent className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-center text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
        {showRetry && onRetry && (
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Pokušaj ponovo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Error boundary wrapper za API greške
interface ApiErrorStateProps {
  error: string | null;
  onRetry?: () => void;
}

export function ApiErrorState({ error, onRetry }: ApiErrorStateProps) {
  if (!error) return null;

  return (
    <EmptyState
      title="Greška pri učitavanju"
      description={error}
      icon="error"
      onRetry={onRetry}
    />
  );
}

// Loading state
interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = 'Učitavanje...' }: LoadingStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 animate-spin">
          <RefreshCw className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
