import React from "react";
import { Loader2, AlertTriangle, LucideIcon } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="p-10 text-center space-y-4 border-destructive/40" role="alert">
      <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
      <p className="text-sm text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Card>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center space-y-4">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action}
    </Card>
  );
}
