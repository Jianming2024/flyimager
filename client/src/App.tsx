import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ImageGalleryPage, { uploadsLoader } from "./pages/ImageGalleryPage";
import ImageUploadPage from "./pages/ImageUploadPage";

const router = createBrowserRouter([
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    {
        path: "/uploads",
        element: <ImageGalleryPage />,
        loader: uploadsLoader,
    },
    {
        path: "/uploads/create",
        element: <ImageUploadPage />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
