import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { postData } from '../../services/backend';

export const RegisterViewContent = () => {
    const [registers, setRegisters] = useState([])
    let { viewid } = useParams();

    useEffect(() => {
        console.log(viewid);
        postData(viewid).then((data) => {
            setRegisters(data);
        });
    }, [viewid, postData]);

    const listRegisters = registers?.map((register) => (
        <tr>
            <td>{register?.Name}</td>
            <td>{register?.Description}</td>
            <td>{register?.Address.Municipality}</td>
            <td>{register?.ContactDetails.PhoneNumber}</td>
        </tr>
    ));

    return <>{listRegisters}</>;
};
