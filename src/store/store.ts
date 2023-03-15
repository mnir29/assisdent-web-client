import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';


interface SchemaStore {
    schema: any;
}

const useSchemaStore =
    create <any>(subscribeWithSelector((set) => ({
        schema: {}
    })));

export default useSchemaStore;
