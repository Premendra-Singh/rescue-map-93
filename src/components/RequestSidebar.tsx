import { AlertTriangle, Heart, Clock, MapPin, ChevronLeft, ChevronRight, CheckCircle, Utensils, Stethoscope, LifeBuoy, Home } from 'lucide-react';
import type { Pin } from '@/lib/supabase';
import { getDistanceKm } from '@/hooks/useGeolocation';

type Props = {
  pins: Pin[];
  userLat: number;
  userLng: number;
  open: boolean;
  onToggle: () => void;
  onResolve: (id: string) => void;
};

const catIcon: Record<string, React.ElementType> = {
  food: Utensils,
  medical: Stethoscope,
  rescue: LifeBuoy,
  shelter: Home,
};

export function RequestSidebar({ pins, userLat, userLng, open, onToggle, onResolve }: Props) {
  const needHelp = pins
    .filter((p) => p.type === 'need_help')
    .map((p) => ({
      ...p,
      distance: getDistanceKm(userLat, userLng, p.latitude, p.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-[1000] rounded-md border border-border bg-card p-2 text-foreground shadow-lg hover:bg-secondary transition-colors md:hidden"
      >
        {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed top-0 left-0 z-[999] h-full w-80 border-r border-border bg-sidebar transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-danger animate-pulse-glow" />
            <h1 className="text-lg font-bold text-foreground tracking-tight">ResCue</h1>
          </div>
          <p className="text-xs text-muted-foreground">Hyper-Local Disaster Map</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-4 border-b border-sidebar-border">
          <div className="rounded-md bg-danger/10 p-3">
            <div className="text-2xl font-bold text-danger font-mono-data">{needHelp.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Need Help</div>
          </div>
          <div className="rounded-md bg-accent/10 p-3">
            <div className="text-2xl font-bold text-accent font-mono-data">
              {pins.filter((p) => p.type === 'can_help').length}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Can Help</div>
          </div>
        </div>

        {/* Active requests */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Active SOS — Nearest First
          </h3>

          {needHelp.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active requests nearby
            </div>
          ) : (
            <div className="space-y-2">
              {needHelp.map((pin) => {
                const CatIcon = catIcon[pin.category] || AlertTriangle;
                return (
                  <div
                    key={pin.id}
                    className="rounded-md border border-border bg-card p-3 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CatIcon className="h-4 w-4 text-danger" />
                        <span className="text-sm font-medium text-foreground capitalize">{pin.category}</span>
                      </div>
                      <button
                        onClick={() => onResolve(pin.id)}
                        title="Mark resolved"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-accent"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </div>
                    {pin.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pin.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono-data">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pin.distance.toFixed(1)}km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(pin.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
