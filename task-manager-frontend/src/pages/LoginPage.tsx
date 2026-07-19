import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {loginUser} from "../services/auth.service.ts";

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;

        if (typeof response?.data?.message === "string") {
            return response.data.message;
        }
    }

    return fallback;
};

const LoginPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            setError("");

            const response = await loginUser({ email, password });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/tasks");
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Login failed"));
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
            <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
                <h1 className="mb-2 text-3xl font-bold text-zinc-100">Login</h1>
                <p className="mb-6 text-zinc-400">Introduce tus credenciales</p>

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-cyan-400"
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-cyan-400"
                    />

                    {error && (
                        <p className="text-sm text-rose-400">{error}</p>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-400"
                    >
                        Iniciar Sesión
                    </button>
                </div>

                <p className="mt-6 text-sm text-zinc-400">
                    No tienes una cuenta?{" "}
                    <Link to="/register" className="text-cyan-400 hover:underline">
                        Regístrate
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default LoginPage;