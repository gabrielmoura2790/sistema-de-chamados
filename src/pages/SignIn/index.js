import React, { useState, useContext } from 'react';
import './signIn.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

import { AuthContext } from '../../contexts/auth';

export default function SignIn() {
    const { signIn, loadingAuth } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function handleSubmit(e) {
        e.preventDefault();

        if (email !== '' && password !== '') {
            signIn(email, password);
        }
    }

    return (
        <div className='container-center'>
            <div className='login'>
                <div className='login-area'>
                    <img src={logo} alt="Sistema Logo" />
                </div>

                <form onSubmit={handleSubmit}>
                    <h1>Entrar</h1>
                    <input
                        type='text'
                        placeholder='email@email.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type='password'
                        placeholder='**********'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type='submit'>{loadingAuth ? 'Carregando...' : 'Acessar'}</button>
                </form>

                <Link to='/register'>Criar uma conta</Link>
            </div>
        </div>
    );
}