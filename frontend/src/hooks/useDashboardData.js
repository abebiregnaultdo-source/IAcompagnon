import { useEffect, useState } from "react";

export function useDashboardData(userId) {
  const [history, setHistory] = useState([]);
  const [creations, setCreations] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [hRes, cRes, rRes] = await Promise.all([
          fetch(`http://localhost:8000/api/state/history?user_id=${userId}`),
          fetch(`http://localhost:8000/api/creations/${userId}`),
          fetch(`http://localhost:8000/api/resources`),
        ]);

        const [hData, cData, rData] = await Promise.all([
          hRes.json(),
          cRes.json(),
          rRes.json(),
        ]);
        if (!mounted) return;
        setHistory(hData.history || []);
        setCreations(cData.creations || []);
        setResources(rData.resources || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Erreur de chargement");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (userId) load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return { history, creations, resources, loading, error };
}
