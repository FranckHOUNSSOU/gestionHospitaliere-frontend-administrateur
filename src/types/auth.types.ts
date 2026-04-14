export interface LoginFormData{
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface User {
    id: string;
    email: string;
    role: 'admin' | 'medecin' | 'AgentAdministatif';
    nom: string;
    prenom: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (date: LoginFormData) => Promise<void>;
    logout: () => void;
}