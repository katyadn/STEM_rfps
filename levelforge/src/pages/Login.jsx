import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode, v) {
  const errors = {};
  if (mode === "register" && v.name.trim().length < 2) {
    errors.name = "Введіть ім’я (щонайменше 2 символи)";
  }
  if (!EMAIL_RE.test(v.email.trim())) {
    errors.email = "Введіть коректну адресу пошти";
  }
  if (mode === "login") {
    if (!v.password) errors.password = "Введіть пароль";
  } else if (
    v.password.length < 8 ||
    !/[A-Za-z]/.test(v.password) ||
    !/\d/.test(v.password)
  ) {
    errors.password = "Щонайменше 8 символів, з літерами та цифрами";
  }
  if (mode === "register" && v.confirm !== v.password) {
    errors.confirm = "Паролі не збігаються";
  }
  return errors;
}

function Field({ id, label, error, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <span id={`${id}-error`} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}

const EMPTY = { name: "", email: "", password: "", confirm: "" };

export default function Login() {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  const [mode, setMode] = useState("login"); // login | register
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  function change(e) {
    setValues({ ...values, [e.target.name]: e.target.value });
  }

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setServerError("");
    setValues(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(mode, values);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await login(values.email, values.password);
      } else {
        await register(values.name, values.email, values.password);
      }
    } catch (err) {
      setServerError(err.message);
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="page">
      <section className="panel auth">
        <h1>{isLogin ? "Вхід" : "Реєстрація"}</h1>

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <Field
              id="name" name="name" label="Ім’я" autoComplete="name"
              value={values.name} onChange={change} error={errors.name}
            />
          )}
          <Field
            id="email" name="email" type="email" label="Пошта"
            autoComplete="email"
            value={values.email} onChange={change} error={errors.email}
          />
          <Field
            id="password" name="password" type="password" label="Пароль"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={values.password} onChange={change} error={errors.password}
          />
          {!isLogin && (
            <Field
              id="confirm" name="confirm" type="password"
              label="Повторіть пароль" autoComplete="new-password"
              value={values.confirm} onChange={change} error={errors.confirm}
            />
          )}

          {serverError && (
            <p className="form-error" role="alert">{serverError}</p>
          )}

          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? "Зачекайте…" : isLogin ? "Увійти" : "Створити акаунт"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Ще немає акаунта?" : "Вже є акаунт?"}{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => switchMode(isLogin ? "register" : "login")}
          >
            {isLogin ? "Зареєструватися" : "Увійти"}
          </button>
        </p>

        {isLogin && (
          <p className="auth-hint">
            Демо-акаунт: demo@levelforge.com / Demo1234
          </p>
        )}
      </section>
    </div>
  );
}
