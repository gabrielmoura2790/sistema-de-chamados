import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Title from '../../components/Title';
import './new.css';

import { AuthContext } from '../../contexts/auth';
import { useHistory, useParams } from 'react-router-dom';
import { FiPlusCircle } from 'react-icons/fi';
import firebase from '../../services/firebaseConnection';
import { toast } from 'react-toastify';

export default function New() {
    const { user } = useContext(AuthContext);

    const { id } = useParams();
    const history = useHistory();

    const [costumers, setCostumers] = useState([]);
    const [loadCostumers, setLoadCostumers] = useState(true);
    const [CostumersSelected, setCostumersSelected] = useState(0);
    const [assunto, setAssunto] = useState('Suporte');
    const [status, setStatus] = useState('Aberto');
    const [complemento, setComplemento] = useState('');

    const [idCostumer, setIdCostumer] = useState(false);

    useEffect(() => {
        async function loadCostumers() {
            await firebase.firestore().collection('costumers')
                .get()
                .then((snapshot) => {

                    let list = [];

                    snapshot.forEach((doc) => {
                        list.push({
                            id: doc.id,
                            nomeFantasia: doc.data().nomeFantasia,
                        })
                    })

                    if (list.length === 0) {
                        console.log('Nenhuma empresa encontrada');
                        setLoadCostumers(false);
                        setCostumers([{ id: '1', nomeFantasia: '' }])
                        return;
                    }

                    setCostumers(list);
                    setLoadCostumers(false);

                    if (id) {
                        loadId(list)
                    }

                })
                .catch((error) => {
                    console.log('Deu algum erro', error);
                    setLoadCostumers(false);
                    setCostumers([{ id: '1', nomeFantasia: '' }])
                })
        }

        loadCostumers();
    }, [id])

    async function loadId(list) {
        await firebase.firestore().collection('chamados').doc(id)
            .get()
            .then((snapshot) => {
                setAssunto(snapshot.data().assunto);
                setStatus(snapshot.data().status);
                setComplemento(snapshot.data().complemento);

                let index = list.findIndex(item => item.id === snapshot.data().clienteID)
                setCostumersSelected(index);
                setIdCostumer(true);

            })
            .catch((error) => {
                console.log(error);
                setIdCostumer(false);
            })
    }

    async function handleRegister(e) {
        e.preventDefault();

        if (idCostumer) {
            await firebase.firestore().collection('chamados')
                .doc(id)
                .update({
                    cliente: costumers[CostumersSelected].nomeFantasia,
                    clienteID: costumers[CostumersSelected].id,
                    assunto: assunto,
                    status: status,
                    complemento: complemento,
                    userId: user.uid
                })
                .then(() => {
                    toast.success("Chamado editado com sucesso!");
                    setCostumersSelected(0);
                    setComplemento('');
                    history.push('/dashboard');
                })
                .catch(() => {
                    toast.error("Erro ao editar chamado.")
                })

            return;
        }

        await firebase.firestore().collection('chamados')
            .add({
                created: new Date(),
                cliente: costumers[CostumersSelected].nomeFantasia,
                clienteID: costumers[CostumersSelected].id,
                assunto: assunto,
                status: status,
                complemento: complemento,
                userId: user.uid
            })
            .then(() => {
                toast.success("Chamado criado com sucesso!");
                setComplemento('');
                setCostumersSelected(0);
            })
            .catch(() => {
                toast.error("Erro ao resgistrar chamado");
            })
    }

    function handleChangeSelect(e) {
        setAssunto(e.target.value);
    }

    function handleOptionChange(e) {
        setStatus(e.target.value);
    }

    function handleChangeCostumers(e) {
        setCostumersSelected(e.target.value);
    }

    return (
        <div>
            <Header />

            <div className='content'>
                <Title name="Novo Chamado">
                    <FiPlusCircle size={25} />
                </Title>

                <div className='container'>

                    <form className='form-profile' onSubmit={handleRegister}>
                        <label>Cliente</label>

                        {loadCostumers ? (
                            <input type="text" disabled value="Carregando clientes..." />
                        ) : (
                            <select value={CostumersSelected} onChange={handleChangeCostumers}>
                                {costumers.map((item, index) => {
                                    return (
                                        <option key={item.id} value={index}>
                                            {item.nomeFantasia}
                                        </option>
                                    )
                                })}
                            </select>
                        )}

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value="Suporte">Suporte</option>
                            <option value="Visita Técnica">Visita Técnica</option>
                            <option value="Financeiro">Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className='status'>
                            <input
                                type='radio'
                                name='radio'
                                value="Aberto"
                                onChange={handleOptionChange}
                                checked={status === 'Aberto'}
                            />
                            <span>Em aberto</span>

                            <input
                                type='radio'
                                name='radio'
                                value="Progresso"
                                onChange={handleOptionChange}
                                checked={status === 'Progresso'}
                            />
                            <span>Progresso</span>

                            <input
                                type='radio'
                                name='radio'
                                value="Atendido"
                                onChange={handleOptionChange}
                                checked={status === 'Atendido'}
                            />
                            <span>Atendido</span>
                        </div>

                        <label>Complemento</label>
                        <textarea
                            type="text"
                            placeholder='Descreva seu problema (Opicional)'
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />

                        <button type='submit'>Registar</button>

                    </form>

                </div>
            </div>
        </div>
    );
}