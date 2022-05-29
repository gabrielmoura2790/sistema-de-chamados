import React, { useState, createContext, useEffect } from 'react';
import firebase from '../services/firebaseConnection';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        function loadStorage() {
            const storageUser = localStorage.getItem('SystemUser');

            if (storageUser) {
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }

            setLoading(false);
        }

        loadStorage();

    }, [])

    //Logar usuário
    async function signIn(email, password) {
        setLoadingAuth(true);
        await firebase.auth().signInWithEmailAndPassword(email, password)
            .then(async (value) => {
                let uid = value.user.uid;

                const userProfile = await firebase.firestore().collection('users').doc(uid).get();

                let data = {
                    uid: uid,
                    nome: userProfile.data().nome,
                    avatarUrl: userProfile.data().avatarUrl,
                    email: value.user.email,
                }

                setUser(data);
                storageUser(data);
                setLoadingAuth(false);
                toast.success('Bem-vindo de volta!');

            })
            .catch((error) => {
                console.log(error);
                toast.error('Ops algo deu errado!');
                setLoadingAuth(false);
            })
    }

    //Cadastrar usuário
    async function signUp(email, password, name) {
        setLoadingAuth(true);
        await firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(async (value) => {
                let uid = value.user.uid;

                await firebase.firestore().collection('users')
                    .doc(uid).set({
                        nome: name,
                        avatarUrl: null,
                    })
                    .then(() => {

                        let data = {
                            uid: uid,
                            nome: name,
                            email: value.user.email,
                            avatarUrl: null,
                        }

                        setUser(data);
                        storageUser(data);
                        setLoadingAuth(false);
                        toast.success('Bem-vindo a plataforma!');

                    })

            })
            .catch((error) => {
                console.log(error);
                toast.error('Ops algo deu errado!');
                setLoadingAuth(false);
            })
    }

    //Deslogar usuário
    async function signOut() {
        await firebase.auth().signOut();
        localStorage.removeItem('SystemUser');
        setUser(null);
    }

    function storageUser(data) {
        localStorage.setItem('SystemUser', JSON.stringify(data));
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, setUser, loading, loadingAuth, signIn, signUp, signOut, storageUser }}>
            {children}
        </AuthContext.Provider>
    );
}