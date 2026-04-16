// useUsers.ts
// Ce hook centralise toute la logique : chargement, filtres, actions sur les comptes.
// Les composants n'ont qu'à appeler ce hook — ils ne touchent jamais l'API directement.

import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { UserFilters } from '../types/user';
import type {  User } from '../types/user';

export function useUsers() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    actif: '',
    service: '',
  });
  // Texte de recherche local — filtrage côté client sur nom/email/numeroOrdre
  // (l'API ne propose pas de param search, donc on filtre après réception)
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers(filters);
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Recharge automatiquement quand les filtres changent
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Met à jour un filtre et recharge
  const updateFilter = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filtrage local par texte de recherche
  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      u.nom.toLowerCase().includes(term) ||
      u.prenom.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.numeroOrdre ?? '').toLowerCase().includes(term)
    );
  });

  // --- Actions sur les comptes ---

  const activateUser = async (id: string) => {
    await userService.activateUser(id);
    // Met à jour localement sans recharger toute la liste
    setUsers(prev => prev.map(u => u.id === id ? { ...u, actif: true } : u));
  };

  const deactivateUser = async (id: string) => {
    await userService.deactivateUser(id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, actif: false } : u));
  };

  const deleteUser = async (id: string) => {
    await userService.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const createUser = async (payload: Parameters<typeof userService.createUser>[0]): Promise<void> => {
    const newUser = await userService.createUser(payload);
    setUsers(prev => [newUser, ...prev]);
    // Ne rien retourner explicitement (Promise<void>)
  };

  return {
    users: filteredUsers,
    totalAll: users.length,      // total avant filtre texte
    loading,
    error,
    filters,
    search,
    setSearch,
    updateFilter,
    refetch: fetchUsers,
    activateUser,
    deactivateUser,
    deleteUser,
    createUser,
  };
}