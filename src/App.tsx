import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

const Home = lazy(() => import("@/pages/Home"));
const Profile = lazy(() => import("@/pages/Profile"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ChooseMe = lazy(() => import("@/pages/games/ChooseMe"));
const GuessByEmoji = lazy(() => import("@/pages/games/GuessByEmoji"));
const Crossword = lazy(() => import("@/pages/games/Crossword"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense>
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
      </Suspense>
    </BrowserRouter>
  );
}
