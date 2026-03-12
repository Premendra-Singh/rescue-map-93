import { useState, useMemo } from 'react';
import { AlertTriangle, Heart, Eye, EyeOff, Loader2 } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { PinForm } from '@/components/PinForm';
import { RequestSidebar } from '@/components/RequestSidebar';
import { useGeolocation, getDistanceKm } from '@/hooks/useGeolocation';
import { usePins } from '@/hooks/usePins';
import { toast } from 'sonner';

const GEOFENCE_KM = 5;

export default function Index() {
  const geo = useGeolocation();
  const { pins, loading, addPin, resolvePin } = usePins();
  const [formType, setFormType] = useState<'need_help' | 'can_help' | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredPins = useMemo(() => {
    if (viewAll) return pins;
    return pins.filter(
      (p) => getDistanceKm(geo.latitude, geo.longitude, p.latitude, p.longitude) <= GEOFENCE_KM
    );
  }, [pins, geo.latitude, geo.longitude, viewAll]);

  const handleSubmit = async (data: Parameters<typeof addPin>[0]) => {
    const ok = await addPin(data);
    if (ok) {
      toast.success(data.type === 'need_help' ? 'SOS sent!' : 'Thank you for offering help!');
    } else {
      toast.error('Failed to submit. Try again.');
    }
    setFormType(null);
  };

  if (loading || geo.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-danger" />
          <span className="text-sm text-muted-foreground font-mono-data">Initializing map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <RequestSidebar
        pins={filteredPins}
        userLat={geo.latitude}
        userLng={geo.longitude}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onResolve={async (id) => {
          const ok = await resolvePin(id);
          if (ok) toast.success('Marked as resolved');
        }}
      />

      {/* Map */}
      <div className="h-full md:ml-80">
        <MapView
          center={[geo.latitude, geo.longitude]}
          pins={filteredPins}
          userLocation={[geo.latitude, geo.longitude]}
          geofenceRadius={GEOFENCE_KM}
          showGeofence={!viewAll}
        />
      </div>

      {/* Geo error banner */}
      {geo.error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1001] rounded-md border border-warning bg-warning/10 px-4 py-2 text-xs text-warning font-mono-data md:left-[calc(50%+10rem)]">
          ⚠ {geo.error}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1001] flex items-center gap-3 md:left-[calc(50%+10rem)]">
        <button
          onClick={() => setFormType('need_help')}
          className="flex items-center gap-2 rounded-full bg-danger px-6 py-3 text-sm font-semibold text-danger-foreground shadow-lg shadow-danger/30 hover:bg-danger/90 transition-all hover:scale-105 active:scale-95"
        >
          <AlertTriangle className="h-4 w-4" />
          I Need Help
        </button>

        <button
          onClick={() => setFormType('can_help')}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all hover:scale-105 active:scale-95"
        >
          <Heart className="h-4 w-4" />
          I Can Help
        </button>

        <button
          onClick={() => setViewAll(!viewAll)}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg hover:bg-secondary transition-all"
          title={viewAll ? 'Show 5km radius' : 'View all pins'}
        >
          {viewAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Pin form modal */}
      {formType && (
        <PinForm
          type={formType}
          onSubmit={handleSubmit}
          onClose={() => setFormType(null)}
          latitude={geo.latitude}
          longitude={geo.longitude}
        />
      )}
    </div>
  );
}
