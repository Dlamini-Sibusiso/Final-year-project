import React, { useEffect, useState } from 'react'
import * as SecurStore from 'expo-secure-store';
import jwtDecode from 'jwt-decode';

const useAuth = () => {
    const [authen, setAuthen] = useState({
        isLoggedIn: false,
        username: null,
        role: null,
        userId: null,
        token: null,
    });

    useEffect(() => {
        const gettingToken = async () => {
            try {
                const token = await SecurStore.getItemAsync('userToken');
                
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
                }
            } catch (err) {
                console.error('Invalid token:', err);
            }
        };

        gettingToken();
    },[]);

  return authen;
}

export default useAuth
