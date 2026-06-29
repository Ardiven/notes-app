import React from "react";
import useAuth from "@hooks/useAuth";
import useInput from "@hooks/useInput";
import { Link } from "react-router-dom";
import useLang from "@hooks/useLang";
import { validateAuthForm } from "@utils/validation";

function LoginInput() {
  const { onlogin, loading, authError } = useAuth();
  const [email, handleEmailChange] = useInput("");
  const [password, handlePasswordChange] = useInput("");
  const { lang } = useLang();

  const [touched, setTouched] = React.useState({});
  const [errors, setErrors] = React.useState({});

  // Re-validate on submit; clear field error as user types
  const onEmailChange = (e) => {
    handleEmailChange(e);
    if (errors.email) {
      setErrors((prev) => {
        const { email: _drop, ...rest } = prev;
        return rest;
      });
    }
  };

  const onPasswordChange = (e) => {
    handlePasswordChange(e);
    if (errors.password) {
      setErrors((prev) => {
        const { password: _drop, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validateAuthForm({ email, password });
    setErrors(fieldErrors);
    setTouched({ email: true, password: true });
    if (Object.keys(fieldErrors).length > 0) return;
    await onlogin(email, password);
  };

  return (
    <>
      <h2>{lang === "id" ? "Yuk, login untuk menggunakan aplikasi." : "Login to use app, please."}</h2>
      <form onSubmit={handleSubmit} className="input-login" noValidate>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={onEmailChange}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={touched.email && errors.email ? "input--error" : ""}
        />
        {touched.email && errors.email && (
          <p id="email-error" className="field-error" data-testid="email-error">
            {errors.email}
          </p>
        )}
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={onPasswordChange}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          aria-invalid={touched.password && !!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={touched.password && errors.password ? "input--error" : ""}
        />
        {touched.password && errors.password && (
          <p id="password-error" className="field-error" data-testid="password-error">
            {errors.password}
          </p>
        )}
        <button disabled={loading}>
          {!loading ? (lang === "id" ? "Masuk" : "Login") : "loading..."}
        </button>
        {authError && <p className="form-error" role="alert">{authError}</p>}
      </form>
      <p>
        {lang === "id" ? "Belum punya akun? " : "Don't have an account? "}
        <Link to="/register">
          {lang === "id" ? "Daftar di sini" : "Register here"}
        </Link>
      </p>
    </>
  );
}

export default LoginInput;