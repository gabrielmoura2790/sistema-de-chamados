import React, { useState } from 'react';
import Header from '../../components/Header';
import Title from '../../components/Title';
import firebase from '../../services/firebaseConnection';
import './costumers.css';

import { FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Costumers() {
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [endereco, setEndereco] = useState('');

    async function handleAdd(e) {
        e.preventDefault();

        if (nomeFantasia !== '' && cnpj !== '' && endereco !== '') {
            await firebase.firestore().collection('costumers')
                .add({
                    nomeFantasia: nomeFantasia,
                    cnpj: cnpj,
                    endereco: endereco,
                })
                .then(() => {
                    setNomeFantasia('');
                    setCnpj('');
                    setEndereco('');

                    toast.success("Empresa cadastrada com sucesso!");
                })
                .catch(() => {
                    toast.error("Erro ao cadastrar essa empresa");
                })
        } else {
            toast.warn("Preencha todos os campos");
        }
    }

    return (
        <div>
            <Header />

            <div className='content'>
                <Title name='Clientes' >
                    <FiUser size={25} />
                </Title>

                <div className='container'>
                    <form className='form-profile costumers' onSubmit={handleAdd}>
                        <label>Nome fantasia</label>
                        <input
                            type='text'
                            value={nomeFantasia}
                            onChange={(e) => setNomeFantasia(e.target.value)}
                            placeholder="Nome da sua empresa"
                        />

                        <label>CNPJ</label>
                        <input
                            type='text'
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            placeholder="Seu CNPJ"
                        />

                        <label>Endereço</label>
                        <input
                            type='text'
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                            placeholder="Endereço da empresa"
                        />

                        <button type='submit'>Cadastrar</button>
                    </form>
                </div>

            </div>
        </div>
    );
}