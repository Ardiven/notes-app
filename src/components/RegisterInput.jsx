import React from "react";
import useAuth from "@hooks/useAuth";
import useInput from "@hooks/useInput";
import { Link } from "react-router-dom";
import useLang from "@hooks/useLang";

function RegisterInput() {
    const { onregister, loading, authError, authSuccess } = useAuth();
    const [name, handleNameChange] = useInput('');
    const [email, handleEmailChange] = useInput('');
    const [password, handlePasswordChange] = useInput('');
    const { lang } = useLang();

    const handleSubmit = (e) => {
        e.preventDefault();
        onregister(name, email, password);
    };

    return (
        <>
            <h2>{lang === "id" ? "Silakan mendaftar untuk menggunakan aplikasi ini." : "Register to use app, please."}</h2>
            <form onSubmit={handleSubmit} className='input-login'>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" value={name} onChange={handleNameChange} />
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={handleEmailChange} />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={handlePasswordChange} />
                <button>{!loading ? (lang === "id" ? "Daftar" : "Register") : 'loading...'}</button>
                {authError && <p className="form-error">{authError}</p>}
                {authSuccess === 'register-success' && (
                    <p className="form-success">
                        {lang === "id" ? "Pendaftaran berhasil. Silakan login." : "Registration successful. Please login."}
                    </p>
                )}
            </form>
            <p>
                {lang === "id" ? "Sudah Memiliki Akun? " : "Already have an account? "}
                <Link to="/login">
                    {lang === "id" ? "Login disini" : "Login here"}
                </Link>
            </p>
        </>
    );
}

export default RegisterInput;