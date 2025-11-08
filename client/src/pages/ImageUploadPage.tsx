import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Api } from "../generated-client";

const imagesApi = new Api({ baseUrl: "/api" });

export default function ImageUploadPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        setIsError(false);

        if (!file) {
            setIsError(true);
            setMessage("Please choose an image file.");
            return;
        }

        setIsSubmitting(true);
        try {
            await imagesApi.api.imagesCreate({ file });

            setIsError(false);
            setMessage("Upload successful. Redirecting to gallery...");
            setTimeout(() => navigate("/uploads"), 800);
        } catch (err) {
            console.error(err);
            setIsError(true);
            setMessage("Upload failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                <div className="card shadow-xl bg-base-100">
                    <div className="card-body space-y-4">
                        <h1 className="card-title text-2xl md:text-3xl">
                            Upload an Image
                        </h1>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="label" htmlFor="file">
                                    <span className="label-text">Choose Image</span>
                                </label>
                                <input
                                    id="file"
                                    type="file"
                                    accept="image/*"
                                    className="file-input file-input-bordered w-full"
                                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                                    required
                                />
                                <p className="text-xs opacity-60 mt-2">
                                    Supported formats: JPG, PNG, GIF.
                                </p>
                            </div>

                            {message && (
                                <p className={`text-sm ${isError ? "text-error" : "text-success"}`}>
                                    {message}
                                </p>
                            )}

                            <div className="flex gap-3 justify-end">
                                <Link to="/uploads" type="button" className="btn btn-ghost">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Uploading..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
