import React, { useEffect, useState, createContext, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { decode as atob } from 'base-64';

// Polyfill atob if it doesn't exist (Hermes fix)
if (typeof global.atob === 'undefined') {
  global.atob = atob;
  //global.atob = (input) => Buffer.from(input, 'base64').toString('binary');
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authen, setAuthen] = useState({
        isLoggedIn: false,
        username: null,
        role: null,
        userId: null,
        token: null,
    });

    const [isLoading, setLoading] = useState(true);

    
        const gettingToken = async () => {
            
            const token = await SecureStore.getItemAsync('userToken');
    
            try { 
                if (token) 
                { 
            
                const decode = jwtDecode(token);

                const username = decode['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
                const role = decode['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                const userId = decode['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                
                setAuthen({
                    isLoggedIn: true,
                    token,
                    username,
                    role,
                    userId,
                });
                } else {//handle missing token
                    setAuthen({
                    isLoggedIn: false,
                    token: null,
                    username: null,
                    role: null,
                    userId: null,
                });
                }
            } catch (err) {
                console.error('Invalid token:', err);
                //if invalid or decode fails, remove it
                await SecureStore.deleteItemAsync('userToken');
                setAuthen({
                    isLoggedIn: false,
                    token: null,
                    username: null,
                    role: null,
                    userId: null,
                });
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        gettingToken();
    },[]);
/*
  return {...authen, isLoading };
};

export default useAuth;
*/

    const login = async (token) => {
        await SecureStore.setItemAsync('userToken', token);
        await gettingToken();//loadToken();
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        setAuthen({
            isLoggedIn: false,
            token: null,
            username: null,
            role: null,
            userId: null,
        });
    };

    return (
        <AuthContext.Provider value={{ ...authen, isLoading, login, logout }}>
            { children }
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
/*
const login = async (token) => {
    try {
        await SecureStore.setItemAsync('userToken', token);
        const decode = jwtDecode(token);

        const username = decode['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        const role = decode['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const userId = decode['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                    
        setAuthen({
            isLoggedIn: true,
            token,
            username,
            role,
            userId,
        });
    } catch (err) {
        console.error("Login: error handling token", err);
    }
};

const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setAuthen({
        isLoggedIn: false,
        username: null,
        role: null,
        userId: null,
        token: null,
    });
};

return (
    <AuthContext.Provider value={{ ...authen, isLoading, login, logout }}>
        {children}
    </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
*/