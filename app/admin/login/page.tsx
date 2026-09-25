"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(login, {});
  return (
    <main className="container">
      <div className="form">
        <h1 style={{ fontSize: 28 }}>Admin Login</h1>
        <p className="muted">Sirf website owner ke liye.</p>
        {state?.error && <p className="danger">{state.error}</p>}
        <form action={formAction}>
          <label>Email</label>
          <input className="input" name="email" type="email" required placeholder="admin@example.com" />
          <label>Password</label>
          <input className="input" name="password" type="password" required placeholder="••••••••" />
          <button className="btn green" disabled={pending}>{pending ? "Checking..." : "Login"}</button>
        </form>
      </div>
    </main>
  );
}
