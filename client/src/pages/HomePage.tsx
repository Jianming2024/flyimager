import { Link, useNavigate, useLoaderData } from "react-router";
import { Api, type InfoResponse } from "../generated-client";

// Use /api proxy for auth/manage endpoints
const authApi = new Api({ baseUrl: "https://image-sharing.fly.dev/api" });

export async function homePageLoader() {
    try {
        const res = await authApi.manage.infoList();
        return res.data as InfoResponse;
    } catch {
        return null;
    }
}

export default function HomePage() {
    const navigate = useNavigate();
    const user = useLoaderData() as InfoResponse | null;

    function handleUploadClick() {
        // If already logged in, go straight to gallery
        if (user) {
            navigate("/uploads");
        } else {
            navigate("/login");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md shadow-xl bg-base-100">
                <div className="card-body space-y-4">
                    <h1 className="text-3xl font-bold text-center">
                        Welcome to <span className="text-primary">Fly Imager</span>
                    </h1>

                    <p className="text-center text-sm text-base-content/70">
                        A simple way to upload and share your images.
                    </p>

                    <button
                        type="button"
                        className="btn btn-primary w-full"
                        onClick={handleUploadClick}
                    >
                        Upload images
                    </button>

                    <p className="text-center text-sm text-base-content/70">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="link link-primary">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
