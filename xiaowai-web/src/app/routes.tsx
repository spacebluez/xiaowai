import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Chat } from "./pages/Chat";
import { Profile } from "./pages/Profile";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { PromptSquare } from "./pages/PromptSquare";
import { Agents } from "./pages/Agents";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/chat",
    Component: Chat,
  },
  {
    path: "/chat/:id",
    Component: Chat,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/history",
    Component: History,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/prompts",
    Component: PromptSquare,
  },
  {
    path: "/agents",
    Component: Agents,
  },
]);