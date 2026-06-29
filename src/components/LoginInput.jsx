import React from "react";
import useAuth from "@hooks/useAuth";
import useInput from "@hooks/useInput";
import { Link } from "react-router-dom";
import useLang from "@hooks/useLang";

function LoginInput() {
  const { onlogin, loading, authError } = useAuth();
  const [email, handleEmailChange] = useInput('');
  const [password, handlePasswordChange] = useInput('');
  const { lang } = useLang();

  const handleSubmit = (e) => {
    e.preventDefault();
    onlogin(email, password);
  };

  return (
    <>
      <h2>{lang === "id" ? "Yuk, login untuk menggunakan aplikasi." : "Login to use app, please."}</h2>
      <form onSubmit={handleSubmit} className='input-login'>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" value={email} onChange={handleEmailChange} />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" value={password} onChange={handlePasswordChange} />
        <button>{!loading ? (lang === "id" ? "Masuk" : "Login") : 'loading...'}</button>
        {authError && <p className="form-error">{authError}</p>}
      </form>
      <p>
        {lang === "id" ? "Belum punya akun?" : "Don't have an account?"}
        <Link to="/register">
          {lang === "id" ? "Daftar di sini" : "Register here"}
        </Link>
      </p>
    </>
  );
}

export default LoginInput;