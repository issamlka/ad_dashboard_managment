import { useState, useEffect } from "react";
import { configService } from "../services/api";

export function useConfig() {
  const [config, setConfig] = useState({
    domain: "Loading...",
    server: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configService.getConfig();
        console.log("Config response:", response.data); // ← add this
        setConfig(response.data);
      } catch (err) {
        console.log("Config error:", err.response?.status, err.message); // ← add this
        setConfig({
          domain: "Active Directory",
          server: "Server Address",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading };
}
