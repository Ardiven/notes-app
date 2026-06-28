import React from "react"
import { login, register, putAccessToken, getUserLogged } from "../utils/api";

const AuthContext = React.createContext();


export function AuthProvider({ children }) {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [initializing, setInitializing] = React.useState(true);

    React.useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
            getUserLogged()
                .then((response) => {
                    if (!response.error) {
                        setUser(response.data.name);
                    } else {
                        // token invalid/expired → bersihkan agar tidak loop
                        localStorage.removeItem('accessToken');
                    }
                    setInitializing(false);
                })
                .catch(() => {
                    // request gagal (network/CORS) → tetap lanjut agar UI tidak stuck
                    localStorage.removeItem('accessToken');
                    setInitializing(false);
                });
        } else {
            setInitializing(false);
        }
    }, []);


    const onlogin = async (email, password) => {
        setLoading(true);

        const response = await login({email, password})
        const data = response.data

        if (response.error){
            setLoading(false);
            throw new Error(response.message)
        }

        putAccessToken(data.accessToken);
        setLoading(false);
        window.location.reload();
        
    }
    const onlogout = () =>{
        setUser(null);
        localStorage.removeItem('accessToken');
    }

    const onregister = async (name, email, password) => {
        setLoading(true);
        const response = await register({name, email, password})
        if (response.error){
            setLoading(false);
            throw new Error(response.message)
        }
        setLoading(false);
    }

    return (
        <AuthContext.Provider value={{user, onlogin, onlogout,onregister, loading, initializing}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;