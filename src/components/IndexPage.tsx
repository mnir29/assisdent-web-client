import { ViewList } from './View/ViewList';
import { useEffect, useState } from 'react';
import { getRegisterViewsFromSchema } from '../utils/Parser';
import useSchemaStore from '../store/store';
import { SchemaStore } from '../types/SchemaStore';

export const IndexPage = () => {
    const [views, setViews] = useState<Document[]>();
    const schemaInStore = useSchemaStore((state: SchemaStore) => state.schema);

    useEffect(() => {
        setViews(getRegisterViewsFromSchema(schemaInStore));
    }, [schemaInStore]);

    const PrintAttributes = ({ views }: { views: Document[] }) => {
        const setOfRegisterItemAttributes = new Set<string>();
        const setOfContentAttributes = new Set<string>();
        const setOfGroupAttributes = new Set<string>();

        views.forEach((v) => {
            const ri =
                v.documentElement.getElementsByTagName('RegisterItem')[0];

            if (!ri) return;

            ri.getAttributeNames().forEach((a) =>
                setOfRegisterItemAttributes.add(a),
            );

            const c = ri.getElementsByTagName('Content')[0];
            const edc = ri.getElementsByTagName('ExtraDataContent')[0];
            c.getAttributeNames().forEach((a) => setOfContentAttributes.add(a));
            edc?.getAttributeNames().forEach((a) =>
                setOfContentAttributes.add(a),
            );

            const g = c.getElementsByTagName('Group');
            const edcg = edc?.getElementsByTagName('Group');
            Array.from(g).forEach((g) => {
                console.log(
                    v.documentElement.getAttribute('Name'),
                    g.getAttribute('ColumnHeader'),
                    g.children,
                );
                g.getAttributeNames().forEach((a) =>
                    setOfGroupAttributes.add(a),
                );
            });

            if (!edcg) return;

            Array.from(edcg).forEach((g) => {
                g.getAttributeNames().forEach((a) =>
                    setOfGroupAttributes.add(a),
                );
            });
        });
        return (
            <div
                className={`px-8 py-4 flex flex-col w-full items-center gap-8`}
            >
                <div className={`columns-2 w-full`}>
                    {Array.from(setOfRegisterItemAttributes.values()).map(
                        (a) => {
                            return <p key={'1' + a}>{a}</p>;
                        },
                    )}
                </div>
                <hr className={`w-full`} />
                <div className={`columns-2 w-full`}>
                    {Array.from(setOfContentAttributes.values()).map((a) => {
                        return <p key={'2' + a}>{a}</p>;
                    })}
                </div>
                <hr className={`w-full`} />
                <div className={`columns-2 w-full`}>
                    {Array.from(setOfGroupAttributes.values()).map((a) => {
                        return <p key={'3' + a}>{a}</p>;
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <p className={`px-8 pt-4 font-semibold`}>Select page:</p>
            <ViewList />
            {views && <PrintAttributes views={views} />}
        </>
    );
};
