import { useQuery } from '@tanstack/react-query';
import useEntityStore from './store/store';

export const OrganizationName = () => {
    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ['organizationName'],
        queryFn: async () => {
            return await fetch(
                `${import.meta.env.VITE_ASSISCARE_BASE}${
                    import.meta.env.VITE_ASSISCARE_ROUTE
                }organization`,
            )
                .then((res) => res.json())
                .then((dt) => dt);
        },
    });

    const entities = useEntityStore((state) => state.entities);

    return (
        <div className="card">
            <h3>{entities}</h3>
            <p>Hello, {import.meta.env.VITE_ASSISCARE_USER}!</p>
            <p>{isLoading ? 'Loading...' : data?.OrganizationName}</p>
            <p>
                {error
                    ? 'Failed to fetch the resource. Is VITE_ASSISCARE_BASE set up correctly?'
                    : ''}
            </p>
        </div>
    );
};
