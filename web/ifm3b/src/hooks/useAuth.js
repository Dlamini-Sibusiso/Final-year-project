import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const token = localStorage.getItem('token');

    let role = null;
    let username = null;

    if (token) {
        try {
            const decode = jwtDecode(token);

            //claims from api
            username = decode['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
            role = decode['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        
        } catch (err) {
            console.error('Invalid token:', err);
        }
    }

    return {
        isLoggedIn: !!token,
        role,
        username,
        token,
    };
};

export default useAuth;