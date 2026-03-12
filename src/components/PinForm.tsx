import { useState } from 'react';
import { X, AlertTriangle, Heart, Utensils, Stethoscope, LifeBuoy, Home } from 'lucide-react';
import type { Pin } from '@/lib/supabase';

type PinFormProps = {
  type: 'need_help' | 'can_help';
  onSubmit: (data: Omit<Pin, 'id' | 'created_at' | 'resolved'>) => void;
  onClose: () => void;
  latitude: number;
  longitude: number;
};

const categories = [
  { value: 'food' as const, label: 'Food & Water', icon: Utensils },
  { value: 'medical' as const, label: 'Medical', icon: Stethoscope },
  { value: 'rescue' as const, label: 'Rescue', icon: LifeBuoy },
  { value: 'shelter' as const, label: 'Shelter', icon: Home },
];

export function PinForm({ type, onSubmit, onClose, latitude, longitude }: PinFormProps) {
  const [category, setCategory] = useState<Pin['category'] | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isNeedHelp = type === 'need_help';

  const handleSubmit = async () => {
    if (!category) return;
    setSubmitting(true);
    onSubmit({ type, category, description: description || null, latitude, longitude });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isNeedHelp ? (
              <AlertTriangle className="h-6 w-6 text-danger" />
            ) : (
              <Heart className="h-6 w-6 text-accent" />
            )}
            <h2 className="text-lg font-semibold text-foreground">
              {isNeedHelp ? 'Request Help' : 'Offer Help'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 rounded-md border p-3 text-sm transition-all ${
                    category === cat.value
                      ? isNeedHelp
                        ? 'border-danger bg-danger/10 text-danger'
                        : 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-secondary text-foreground hover:bg-muted'
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isNeedHelp ? 'Describe your situation...' : 'What help can you provide?'}
              className="w-full rounded-md border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono-data">
            <span>📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!category || submitting}
            className={`w-full rounded-md py-3 text-sm font-semibold transition-all disabled:opacity-40 ${
              isNeedHelp
                ? 'bg-danger text-danger-foreground hover:bg-danger/90'
                : 'bg-accent text-accent-foreground hover:bg-accent/90'
            }`}
          >
            {submitting ? 'Submitting...' : isNeedHelp ? 'Send SOS' : 'Offer Help'}
          </button>
        </div>
      </div>
    </div>
  );
}
