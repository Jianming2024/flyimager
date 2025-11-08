import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { Api, type ImageListItem } from "../generated-client";

const imagesApi = new Api({ baseUrl: "/api" });

// Loader for route `/uploads`
export async function uploadsLoader() {
    const res = await imagesApi.api.imagesList();
    return res.data as ImageListItem[];
}

export default function ImageGalleryPage() {
    const navigate = useNavigate();
    const uploads = useLoaderData() as ImageListItem[];
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    const shareLink = (id: string) => {
        const link = `${location.origin}/api/images/${id}`;
        navigator.clipboard.writeText(link);
        setIsError(false);
        setMessage("Link copied to clipboard.");
    };

    const deleteFile = async (id: string) => {
        setMessage(null);
        setIsError(false);

        try {
            await imagesApi.api.imagesDelete(id);
            setIsError(false);
            setMessage("Image deleted.");
            // reload route loader
            navigate(".", { replace: true });
        } catch (err) {
            console.error(err);
            setIsError(true);
            setMessage("Failed to delete image. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-base-200 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Your images</h1>
                    <Link to="/uploads/create" className="btn btn-primary">
                        Upload new image
                    </Link>
                </div>

                {message && (
                    <p className={`mb-4 text-sm ${isError ? "text-error" : "text-success"}`}>
                        {message}
                    </p>
                )}

                {uploads.length === 0 ? (
                    <div className="bg-base-100 shadow-xl rounded-lg p-6 text-center">
                        <p className="mb-4">You haven&apos;t uploaded any images yet.</p>
                        <Link to="/uploads/create" className="btn btn-primary">
                            Upload your first image
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
                        <table className="table w-full">
                            <thead>
                            <tr>
                                <th>Preview</th>
                                <th>File name</th>
                                <th>Uploaded at</th>
                                <th className="text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {uploads.map((file) => (
                                <tr key={file.id}>
                                    <td>
                                        <a
                                            href={`/api/images/${file.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img
                                                src={`/api/images/${file.id}`}
                                                alt={file.fileName}
                                                className="h-16 w-16 object-cover rounded"
                                            />
                                        </a>
                                    </td>
                                    <td>{file.fileName}</td>
                                    <td>{new Date(file.createdAtUtc).toLocaleString()}</td>
                                    <td className="text-right space-x-2">
                                        <button
                                            className="btn btn-sm btn-error"
                                            onClick={() => deleteFile(file.id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => shareLink(file.id)}
                                        >
                                            Share
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
