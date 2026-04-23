import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthProvider";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import GiftGenerator from "@/pages/GiftGenerator";

const Home = lazy(() => import("@/pages/Home"));
const Profile = lazy(() => import("@/pages/Profile"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const ChooseMe = lazy(() => import("@/pages/games/ChooseMe"));
const GuessByEmoji = lazy(() => import("@/pages/games/GuessByEmoji"));
const Crossword = lazy(() => import("@/pages/games/Crossword"));
const GameDetails = lazy(() => import("@/pages/games/GameDetails"));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/create/choose-me" element={<ChooseMe />} />
                <Route
                  path="/create/guess-by-emoji"
                  element={<GuessByEmoji />}
                />
                <Route path="/create/crossword" element={<Crossword />} />
                <Route path="/games/:gameId" element={<GameDetails />} />
                <Route path="/gift-generator" element={<GiftGenerator />} />
              </Route>
            </Route>

            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}