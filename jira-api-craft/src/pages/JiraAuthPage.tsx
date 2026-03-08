import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Loader2, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/apiconfig";

const JiraAuthPage = () => {
  const { loginJira } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      return;
    }

    // Redirect to backend login page
    // Backend will handle OAuth and redirect back to /health with token
    const params = new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
    });
    
    window.location.href = `${API_BASE_URL}/jira/login?${params.toString()}`;
  };

  const handleDemoLogin = async () => {
    // Redirect to backend login page with demo credentials
    const params = new URLSearchParams({
      username: "sarah.chen",
      password: "password123",
    });
    
    window.location.href = `${API_BASE_URL}/jira/login?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Login to Jira</h1>
            <p className="text-muted-foreground text-sm">
              Connect to your Jira workspace to access projects and issues
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground mb-2">Demo Credentials:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="font-medium">Username:</span> sarah.chen, john.doe, or admin</p>
              <p><span className="font-medium">Password:</span> password123 or admin</p>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-3 w-full text-xs px-3 py-2 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Quick Demo Login
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username or Email
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter your username or email"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg gradient-bg text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting to Jira...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login to Jira
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              This is a demo environment. In production, you would use OAuth2 or API tokens.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JiraAuthPage;
