import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { loginStyles } from "../styles/login.styles";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      const data = response.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        {/* Title */}
        <div className="text-center mb-4">
          <h2 style={loginStyles.title}>User Management</h2>
          <p style={loginStyles.subtitle}>Sign in to your account</p>
        </div>

        {/* Error */}
        {error && <div style={loginStyles.errorAlert}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label style={loginStyles.label}>Username</label>
            <input
              type="text"
              style={loginStyles.input}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label style={loginStyles.label}>Password</label>
            <input
              type="password"
              style={loginStyles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={loading ? loginStyles.buttonDisabled : loginStyles.button}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={loginStyles.helperText}></p>
      </div>
    </div>
  );
}
