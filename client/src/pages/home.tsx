import { useAuth } from "@/hooks/use-auth";
import { Landing } from "@/components/Landing";
import { Dashboard } from "@/components/Dashboard";
import { AdminDashboard } from "@/components/AdminDashboard";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold gradient-text mb-2">Edwards Anonymous</div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (user.isAdmin) {
    return <AdminDashboard />;
  }

  return <Dashboard />;
}
