import React from 'react';
import ModalFooter from './ModalFooter';

type ModalProps = {
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

function Modal(props: ModalProps) {
    return (
        <>
            <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                    {props.title}
                </h2>

                <button className="bg-red-900 text-white px-4 py-2 rounded">
                    Sulje
                </button>
            </div>

            {props.children}
            {props.footer}
        </>
    );
}

export default Modal;
