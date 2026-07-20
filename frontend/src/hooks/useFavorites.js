import React from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthProvider.jsx";

// Gerencia favoritos do cliente logado (servicos e profissionais).
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = React.useState([]);

  const reload = React.useCallback(() => {
    if (!user) {
      setFavorites([]);
      return Promise.resolve([]);
    }
    return api("/favoritos")
      .then((data) => {
        setFavorites(data);
        return data;
      })
      .catch(() => setFavorites([]));
  }, [user]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const favoriteServiceIds = React.useMemo(
    () => new Set(favorites.filter((f) => f.serviceId).map((f) => f.serviceId)),
    [favorites]
  );
  const favoriteProfessionalIds = React.useMemo(
    () => new Set(favorites.filter((f) => f.professionalId).map((f) => f.professionalId)),
    [favorites]
  );

  async function toggle(target) {
    if (!user) return;
    const isService = "serviceId" in target;
    const set = isService ? favoriteServiceIds : favoriteProfessionalIds;
    const id = isService ? target.serviceId : target.professionalId;
    const method = set.has(id) ? "DELETE" : "POST";
    await api("/favoritos", { method, body: JSON.stringify(target) });
    await reload();
  }

  return { favorites, favoriteServiceIds, favoriteProfessionalIds, toggle, reload, enabled: !!user };
}
