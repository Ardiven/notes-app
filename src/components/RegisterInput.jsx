import React from "react";
import useAuth from "@hooks/useAuth";
import useInput from "../hooks/useInput";
import { Link } from "react-router-dom";
import useLang from "@hooks/useLang";
import { validateAuthForm } from "@utils/validation";

function RegisterInput() {
    const { onregister, loading, authError, authSuccess } = useAuth();
    const [name, handleNameChange] = useInput("");
    const [email, handleEmailChange] = useInput("");
    const [password, handlePasswordChange] = useInput("");
    const { lang } = useLang();

    const [touched, setTouched] = React.useState({});
    const [errors, setErrors] = React.useState({});

    const clearFieldError = (field) => {
        setErrors((prev) => {
            const { [field]: _drop, ...rest } = prev;
            return rest;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fieldErrors = validateAuthForm({ name, email, password, isRegister: true });
        setErrors(fieldErrors);
        setTouched({ name: true, email: true, password: true });
        if (Object.keys(fieldErrors).length > 0) return;
        // No navigate() here — authSuccess state surfaces the success message
        // and the user clicks the link to /login (which RedirectIfAuthed will
        // not bounce from, since registration does NOT set user state).
        await onregister(name, email, password);
    };

    const fieldClass = (field) =>
        touched[field] && errors[field] ? "input--error" : "";

    return (
        <>
            <h2>{lang === "id" ? "Silakan mendaftar untuk menggunakan aplikasi ini." : "Register to use app, please."}</h2>
            <form onSubmit={handleSubmit} className="input-register" noValidate>
                <label htmlFor="name">{lang === "id" ? "Nama" : "Name"}</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => { handleNameChange(e); clearFieldError("name"); }}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    aria-invalid={touched.name && !!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={fieldClass("name")}
                />
                {touched.name && errors.name && (
                    <p id="name-error" className="field-error" data-testid="name-error">
                        {errors.name}
                    </p>
                )}
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => { handleEmailChange(e); clearFieldError("email"); }}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    aria-invalid={touched.email && !!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={fieldClass("email")}
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
                    onChange={(e) => { handlePasswordChange(e); clearFieldError("password"); }}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    aria-invalid={touched.password && !!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={fieldClass("password")}
                />
                {touched.password && errors.password && (
                    <p id="password-error" className="field-error" data-testid="password-error">
                        {errors.password}
                    </p>
                )}
                <button disabled={loading}>
                    {!loading ? (lang === "id" ? "Daftar" : "Register") : "loading..."}
                </button>
                {authError && <p className="form-error" role="alert">{authError}</p>}
                {authSuccess === "register-success" && (
                    <p className="form-success" role="status">
                        {lang === "id"
                            ? "Pendaftaran berhasil. Silakan login."
                            : "Registration successful. Please login."}
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