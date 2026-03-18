import { supabase } from './supabaseClient';

function store(table) {
  return {
    list: async (sortField, limit = 100) => {
      let query = supabase.from(table).select('*').limit(limit);
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = desc ? sortField.slice(1) : sortField;
        query = query.order(field, { ascending: !desc });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    filter: async (filters) => {
      let query = supabase.from(table).select('*');
      Object.entries(filters).forEach(([k, v]) => {
        query = query.eq(k, v);
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    create: async (data) => {
      const { data: created, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return created;
    },

    update: async (id, data) => {
      const { data: updated, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    delete: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

export const db = {
  entities: {
    Race:        store('races'),
    Strategy:    store('strategies'),
    League:      store('leagues'),
    Challenge:   store('challenges'),
    Duel:        store('duels'),
    Profile:     store('profiles'),
    BanterPost:  store('banter_posts'),
    ProStrategy: store('pro_strategies'),
  },
};

export const base44 = db;
