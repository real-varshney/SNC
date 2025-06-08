const fakeStore = new Map();

global.caches = {
  open: async (name) => ({
    match: async (request) => {
      return fakeStore.get(name + ':' + request.toString()) || null;
    },
    put: async (request, response) => {
      fakeStore.set(name + ':' + request.toString(), response);
    },
    delete: async (request) => {
      return fakeStore.delete(name + ':' + request.toString());
    },
    keys: async () => {
      return [...fakeStore.keys()]
        .filter(k => k.startsWith(name + ':'))
        .map(k => new Request(k.replace(name + ':', '')));
    },
  }),
  delete: async (name) => {
    for (const key of fakeStore.keys()) {
      if (key.startsWith(name + ':')) {
        fakeStore.delete(key);
      }
    }
    return true;
  },
};
