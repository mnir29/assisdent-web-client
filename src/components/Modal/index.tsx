import React from 'react';
import ModalFooter from './ModalFooter';

type ModalProps = {
    title: string;
    children: React.ReactNode;
    close: () => void;
    visible: boolean;
    footer?: React.ReactNode;
};

/**
 * Store the state of the modal in the parent component.
 */
function Modal(props: ModalProps) {
    // floating on top of the page
    if (!props.visible) return <></>;
    return (
        <>
            <div className="fixed h-screen w-screen">
                <div className="relative p-5 m-5 rounded shadow-2xl bg-white h-screen">
                    <div className="flex justify-between">
                        <h1 className="text-6xl font-bold text-blue-900">
                            {props.title}
                        </h1>

                        <button
                            onClick={props.close}
                            className="bg-red-900 text-white px-4 py-2 rounded"
                        >
                            Sulje
                        </button>
                    </div>
                    <hr className="h-px my-8 border-0 bg-gray-700" />
                    <div className="text-black ">{props.children}</div>
                    {props.footer}
                </div>
            </div>
        </>
    );
}

export default Modal;
