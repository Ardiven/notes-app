import React from "react";
import { login, register, putAccessToken, getUserLogged } from "@utils/api";

const AuthContext = React.createContext();


export function AuthProvider({ children }) {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [initializing, setInitializing] = React.useState(true);
    const [authError, setAuthError] = React.useState(null);
    const [authSuccess, setAuthSuccess] = React.useState(null);

    React.useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
            getUserLogged()
                .then((response) => {
                    if (!response.error) {
                        setUser(response.data.name);
                    } else {
                        localStorage.removeItem('accessToken');
                    }
                    setInitializing(false);
                })
                .catch(() => {
                    localStorage.removeItem('accessToken');
                    setInitializing(false);
                });
        } else {
            setInitializing(false);
        }
    }, []);


    const onlogin = React.useCallback(async (email, password) => {
        setLoading(true);
        setAuthError(null);
        setAuthSuccess(null);
        const response = await login({ email, password });

        if (response.error) {
            setLoading(false);
            setAuthError(response.message || 'Login failed');
            return { error: true, message: response.message };
        }

        // /login endpoint returns { accessToken, userId } — no name.
        // Persist token then fetch profile to get the name.
        putAccessToken(response.data.accessToken);

        const profileResponse = await getUserLogged();
        if (profileResponse.error) {
            setLoading(false);
            setAuthError(profileResponse.message || 'Login failed');
            return { error: true, message: profileResponse.message };
        }

        setUser(profileResponse.data.name);
        setLoading(false);
        return { error: false };
    }, []);

    const onlogout = React.useCallback(() => {
        setUser(null);
        localStorage.removeItem('accessToken');
        setAuthError(null);
        setAuthSuccess(null);
    }, []);

    const onregister = React.useCallback(async (name, email, password) => {
        setLoading(true);
        setAuthError(null);
        setAuthSuccess(null);
        const response = await register({ name, email, password });

        if (response.error) {
            setLoading(false);
            setAuthError(response.message || 'Register failed');
            return { error: true, message: response.message };
        }

        setLoading(false);
        setAuthSuccess('register-success');
        return { error: false };
    }, []);

    const value = React.useMemo(() => ({
        user,
        onlogin,
        onlogout,
        onregister,
        loading,
        initializing,
        authError,
        authSuccess,
    }), [user, loading, initializing, authError, authSuccess, onlogin, onlogout, onregister]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;