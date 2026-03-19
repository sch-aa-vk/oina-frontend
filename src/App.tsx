import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ChooseMe from "./pages/games/ChooseMe";
import GuessByEmoji from "./pages/games/GuessByEmoji";
import Crossword from "./pages/games/Crossword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main pages — with sidebar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create/choose-me" element={<ChooseMe />} />
          <Route path="/create/guess-by-emoji" element={<GuessByEmoji />} />
          <Route path="/create/crossword" element={<Crossword />} />
        </Route>

        {/* Auth pages — no sidebar */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
