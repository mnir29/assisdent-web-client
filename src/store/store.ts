import { create } from 'zustand';

interface EntityStore {
    entities: [] | [any];
}

const useEntityStore = create<EntityStore>((set) => ({
    entities: ['Entity 1'],
}));

export default useEntityStore;
