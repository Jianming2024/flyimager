import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Api } from "../generated-client";

const authApi = new Api({ baseUrl: "/api" });

export default function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        setIsError(false);
        setIsSubmitting(true);

        try {
            await authApi.register.registerCreate({ email, password });

            setIsError(false);
            setMessage("Registered successfully 🎉 Redirecting to login...");
            setTimeout(() => navigate("/login"), 800);
        } catch (err: unknown) {
            console.error(err);
            setIsError(true);

            let msg = "Registration failed. Please check your password rules.";
            if (err instanceof Error && err.message) {
                msg = err.message;
            }

            setMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md shadow-xl bg-base-100">
                <div className="card-body space-y-4">
                    <h2 className="text-2xl font-bold text-center">
                        Create your <span className="text-primary">Fly Imager</span> account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="form-control">
                            <label className="label" htmlFor="email">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={`input input-bordered w-full ${
                                    isError ? "input-error" : ""
                                }`}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="form-control">
                            <label className="label" htmlFor="password">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                id="password"
                                type="password"
                                className={`input input-bordered w-full ${
                                    isError ? "input-error" : ""
                                }`}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Message */}
                        {message && (
                            <p className={`text-sm ${isError ? "text-error" : "text-success"}`}>
                                {message}
                            </p>
                        )}

                        {/* Submit */}
                        <div className="form-control mt-2">
                            <button
                                type="submit"
                                className={`btn btn-primary w-full ${
                                    isSubmitting ? "loading" : ""
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating account..." : "Register"}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-base-content/70">
                        Already have an account?{" "}
                        <Link to="/login" className="link link-primary">
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
