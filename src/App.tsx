import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import Modal from './components/Modal';
import { useState } from 'react';

function App() {
    const queryClient = new QueryClient();
    const [modal, setModal] = useState(true);

    return (
        <QueryClientProvider client={queryClient}>
            <div className="w-screen h-screen">
                <Sidebar />

                <Modal
                    title="Test"
                    visible={modal}
                    close={() => {
                        setModal(false);
                    }}
                >
                    <h1>Valitse yritys</h1>
                </Modal>
            </div>
        </QueryClientProvider>
    );
}

export default App;
