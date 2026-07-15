import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create account");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { key: "name", label: "Name", type: "text", placeholder: "Ada Lovelace" },
    { key: "username", label: "Username", type: "text", placeholder: "ada" },
    { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { key: "password", label: "Password", type: "password", placeholder: "At least 6 characters" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-signal-500" />
          <h1 className="font-display text-3xl text-ink-50">Create your account</h1>
          <p className="mt-1 text-sm text-ink-400">Takes less than a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink-400">
                {f.label}
              </label>
              <input
                type={f.type}
                required
                minLength={f.key === "password" ? 6 : undefined}
                value={form[f.key]}
                onChange={update(f.key)}
                className="w-full rounded-xl border border-ink-800 bg-ink-900 px-4 py-2.5 text-ink-50 placeholder-ink-600 focus:border-ember-500"
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-ember-500 py-2.5 font-medium text-ink-950 transition hover:bg-ember-400 disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account?{" "}
          <Link to="/login" className="text-signal-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
