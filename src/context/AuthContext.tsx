
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, role: "admin" | "user") => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo purposes (in a real app, this would be from a database)
const MOCK_USERS = [
  { 
    id: "admin-1", 
    name: "Admin User", 
    email: "admin@example.com", 
    password: "admin123", 
    role: "admin" as const
  },
  { 
    id: "user-1", 
    name: "Regular User", 
    email: "user@example.com", 
    password: "user123", 
    role: "user" as const
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("grievance_system_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: "admin" | "user"): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password && u.role === role
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("grievance_system_user", JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };
  
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const userExists = MOCK_USERS.some(u => u.email === email);
    
    if (userExists) {
      setIsLoading(false);
      return false;
    }
    
    // In a real app, you'd add the user to a database
    // For demo purposes, we'll just set up the session
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: "user" as const
    };
    
    setUser(newUser);
    localStorage.setItem("grievance_system_user", JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("grievance_system_user");
  };
  
  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
