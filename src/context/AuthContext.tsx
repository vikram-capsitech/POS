import { createContext, useContext, useState, useEffect } from 'react';


interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'waiter' | 'kitchen' | 'customer';
    restaurantId?: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    activeRestaurantId: string | undefined;
    setActiveRestaurantId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [activeRestaurantId, setActiveRestaurantIdState] = useState<string | undefined>(undefined);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            if (userData.restaurantId) {
                setActiveRestaurantIdState(userData.restaurantId);
            }
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        if (userData.restaurantId) {
            setActiveRestaurantIdState(userData.restaurantId);
        }
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setActiveRestaurantIdState(undefined);
        localStorage.removeItem('userInfo');
        window.location.href = '/login'; // Hard reload/redirect
    };

    const setActiveRestaurantId = (id: string) => {
        setActiveRestaurantIdState(id);
        // Persist via user update? Or just state?
        // If Admin changes scope, we might want to keep it.
        // For now, simple state is enough for "Settings" page to work, 
        // but if they refresh, it reverts to logged in user's ID.
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, activeRestaurantId, setActiveRestaurantId }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
