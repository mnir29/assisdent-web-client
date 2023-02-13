import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

export const OrganizationName = () => {
    const dispatch = useDispatch();

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

    // TODO: testing
    dispatch({
        type: 'RECEIVED_DATA',
        payload: 'TEST'
    });

    return (
        <div className="card">
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
