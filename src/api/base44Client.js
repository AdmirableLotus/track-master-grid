// Local data store replacing Base44 SDK — uses localStorage for persistence

function store(key) {
  const load = () => JSON.parse(localStorage.getItem(key) || '[]');
  const save = (data) => localStorage.setItem(key, JSON.stringify(data));

  return {
    list: (sortField, limit = 100) => {
      let items = load();
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = desc ? sortField.slice(1) : sortField;
        items = items.sort((a, b) => {
          if (a[field] < b[field]) return desc ? 1 : -1;
          if (a[field] > b[field]) return desc ? -1 : 1;
          return 0;
        });
      }
      return Promise.resolve(items.slice(0, limit));
    },
    filter: (query) => {
      const items = load();
      const result = items.filter(item =>
        Object.entries(query).every(([k, v]) => item[k] === v)
      );
      return Promise.resolve(result);
    },
    create: (data) => {
      const items = load();
      const newItem = { ...data, id: crypto.randomUUID(), created_date: new Date().toISOString() };
      save([...items, newItem]);
      return Promise.resolve(newItem);
    },
    update: (id, data) => {
      const items = load();
      const updated = items.map(i => i.id === id ? { ...i, ...data } : i);
      save(updated);
      return Promise.resolve(updated.find(i => i.id === id));
    },
    delete: (id) => {
      save(load().filter(i => i.id !== id));
      return Promise.resolve();
    },
  };
}

export const base44 = {
  entities: {
    Race: store('pitwall_races'),
    Strategy: store('pitwall_strategies'),
    League: store('pitwall_leagues'),
  },
  auth: {
    me: () => Promise.resolve(JSON.parse(localStorage.getItem('pitwall_user') || 'null')),
  },
};
