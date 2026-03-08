import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Landing from "./pages/Landing";
import DashboardLayout from "./layouts/DashboardLayout";
import ProjectsPage from "./pages/ProjectsPage";
import IssuesPage from "./pages/IssuesPage";
import PostmanPage from "./pages/PostmanPage";
import PostmanCollectionPage from "./pages/PostmanCollectionPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import JiraAuthPage from "./pages/JiraAuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth/jira" element={<JiraAuthPage />}/>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="projects" replace />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/:projectKey" element={<IssuesPage />} />
                  <Route path="postman" element={<PostmanPage />} />
                  <Route path="postman/collection/:collectionId" element={<PostmanCollectionPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
