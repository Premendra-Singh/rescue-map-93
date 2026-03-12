import { useState, useEffect, useCallback } from 'react';
import { supabase, type Pin } from '@/lib/supabase';

export function usePins() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPins = useCallback(async () => {
    const { data, error } = await supabase
      .from('pins')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPins(data as Pin[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPins();

    const channel = supabase
      .channel('pins-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, () => {
        fetchPins();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPins]);

  const addPin = async (pin: Omit<Pin, 'id' | 'created_at' | 'resolved'>) => {
    const { error } = await supabase.from('pins').insert(pin);
    return !error;
  };

  const resolvePin = async (id: string) => {
    const { error } = await supabase.from('pins').update({ resolved: true }).eq('id', id);
    return !error;
  };

  return { pins, loading, addPin, resolvePin };
}
