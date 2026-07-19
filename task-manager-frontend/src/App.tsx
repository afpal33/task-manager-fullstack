import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import TasksPage from "./pages/TasksPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";

function App() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/tasks" replace/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>

                    <Route element={<ProtectedRoute/>}>
                        <Route path="/tasks" element={<TasksPage/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
