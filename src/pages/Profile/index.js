import React, { useState, useContext } from 'react';
import './profile.css';
import firebase from '../../services/firebaseConnection';
import Header from '../../components/Header';
import Title from '../../components/Title';

import { FiSettings, FiUpload } from 'react-icons/fi';
import avatar from '../../assets/avatar.png';
import { toast } from 'react-toastify';

import { AuthContext } from '../../contexts/auth';

export default function Profile() {
    const { user, setUser, signOut, storageUser } = useContext(AuthContext);

    const [nome, setNome] = useState(user && user.nome);
    const [email, setEmail] = useState(user && user.email);
    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl);
    const [imageAvatar, setImageAvatar] = useState(null);

    function handleFile(e) {

        if (e.target.files[0]) {
            const image = e.target.files[0];

            if (image.type === 'image/jpeg' || image.type === 'image/png') {
                setImageAvatar(image);
                setAvatarUrl(URL.createObjectURL(e.target.files[0]))
            } else {
                toast.warning("Envie uma imagem do tipo PNG ou JPEG");
                setImageAvatar(null);
                return null;
            }
        }

    }

    async function handleUpload() {
        const currentUid = user.uid;

        const uploadTask = await firebase.storage()
            .ref(`images/${currentUid}/${imageAvatar.name}`)
            .put(imageAvatar)
            .then(async () => {
                await firebase.storage().ref(`images/${currentUid}`)
                    .child(imageAvatar.name).getDownloadURL()
                    .then(async (url) => {
                        let urlFoto = url;

                        await firebase.firestore().collection('users')
                            .doc(user.uid)
                            .update({
                                avatarUrl: urlFoto,
                                nome: nome
                            })
                            .then(() => {
                                let data = {
                                    ...user,
                                    avatarUrl: urlFoto,
                                    nome: nome,
                                }

                                toast.success("Dados atualizados com sucesso!");
                                setUser(data);
                                storageUser(data);
                            })
                            .catch(() => {
                                toast.error("Ops algo inesperado aconteceu");
                            })
                    })
            })
    }

    async function handleSave(e) {
        e.preventDefault();

        if (imageAvatar === null && nome !== '') {
            await firebase.firestore().collection('users')
                .doc(user.uid)
                .update({
                    nome: nome,
                })
                .then(() => {
                    let data = {
                        ...user,
                        nome: nome,
                    };

                    setUser(data);
                    storageUser(data);
                })
        } else if (nome !== '' && imageAvatar !== null) {
            handleUpload();
        }
    }

    return (
        <div>
            <Header />

            <div className='content'>
                <Title name="Meu Perfil">
                    <FiSettings size={25} />
                </Title>
                <div className='container'>
                    <form className='form-profile' onSubmit={handleSave}>
                        <label className='label-avatar'>
                            <span>
                                <FiUpload color='#FFF' size={25} />
                            </span>

                            <input type='file' accept='image/*' onChange={handleFile} /><br />
                            {avatarUrl === null ?
                                <img src={avatar} height='250' width='250' alt='Foto de perfil do usuário' />
                                :
                                <img src={avatarUrl} height='250' width='250' alt='Foto de perfil do usuário' />
                            }
                        </label>

                        <label>Nome</label>
                        <input type='text' value={nome} onChange={(e) => setNome(e.target.value)} />

                        <label>Email</label>
                        <input type='text' value={email} disabled />

                        <button type='submit'>Salvar</button>
                    </form>
                </div>

                <div className='container'>
                    <button className='logout-btn' onClick={() => signOut()}>Sair</button>
                </div>

            </div>

        </div>
    );
}