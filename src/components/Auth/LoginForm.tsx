import Button from '../Button';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../services/backend';
import { useState } from 'react';

export default function LoginForm() {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = (e) => {
        const username = e.target.username.value;
        const password = e.target.password.value;

        console.log(username, password);
        e.preventDefault();
        getToken(username, password).then((res) => {
            console.log(res);
            if (res.success) {
                navigate('/dash');
            } else {
                console.log("ERROR");
                setErrorMsg(res.error);
            }
        });
    };

    return (
        <div className="container grid h-screen place-items-center">
            <form
                className="space-y-4 md:space-y-6"
                onSubmit={(e) => handleLogin(e)}
            >
                <strong>AssisDent kirjautuminen</strong>
                {errorMsg ? <p>{errorMsg}</p>: ''}
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Käyttäjätunnus
                    <input
                        name="username"
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                </label>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Salasana
                    <input
                        name="password"
                        type="password"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                </label>
                <button type="submit">Kirjaudu</button>
            </form>
        </div>
    );
}
