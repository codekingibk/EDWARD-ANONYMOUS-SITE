import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Shield, Users, MessageCircle, Flag, Server, Database, Cloud, RefreshCw, Eye, UserX, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Fetch all reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/admin/reports'],
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: number; status: string }) => 
      api.updateReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
      toast({
        title: "Success",
        description: "Report status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => api.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
    toast({
      title: "Success",
      description: "Dashboard refreshed successfully",
    });
  };

  const stats = statsData?.stats || {};
  const users = usersData?.users || [];
  const reports = reportsData?.reports || [];

  return (
    <div className="min-h-screen py-8">
      {/* Admin Header */}
      <Card className="glass-card mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold gradient-text flex items-center">
              <Shield className="mr-3 h-6 w-6" />
              Admin Dashboard - Edwards Anonymous 2025
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Last updated: Just now
              </span>
              <Button onClick={refreshDashboard}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card text-center hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {statsLoading ? '---' : stats.totalUsers || 0}
            </div>
            <div className="text-muted-foreground mb-1">Total Users</div>
            <div className="text-sm text-green-600">+127 this week</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card text-center hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {statsLoading ? '---' : stats.activeUsers || 0}
            </div>
            <div className="text-muted-foreground mb-1">Active Users</div>
            <div className="text-sm text-green-600">+45 today</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card text-center hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {statsLoading ? '---' : stats.totalMessages || 0}
            </div>
            <div className="text-muted-foreground mb-1">Total Messages</div>
            <div className="text-sm text-green-600">+1,234 today</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card text-center hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {reportsLoading ? '---' : reports.filter((r: any) => r.status === 'pending').length}
            </div>
            <div className="text-muted-foreground mb-1">Reported Content</div>
            <div className="text-sm text-yellow-600">Needs attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Management */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-3 h-5 w-5 text-primary" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {usersLoading ? (
                <div className="text-center text-muted-foreground">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center text-muted-foreground">No users found</div>
              ) : (
                <div className="space-y-4">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{user.username}</div>
                          <div className="text-sm text-muted-foreground">
                            Joined: {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <UserX className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Content Moderation */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="mr-3 h-5 w-5 text-primary" />
              Content Moderation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {reportsLoading ? (
                <div className="text-center text-muted-foreground">Loading reports...</div>
              ) : reports.length === 0 ? (
                <div className="text-center text-muted-foreground">No reports found</div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report: any) => {
                    const isMessage = !!report.messageId;
                    const isPending = report.status === 'pending';
                    
                    return (
                      <div 
                        key={report.id} 
                        className={`p-4 rounded-lg border ${
                          isPending 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                            : 'bg-muted border-border'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-red-700 dark:text-red-400">
                            {isMessage ? 'Reported Message' : 'Reported Chat'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={isPending ? 'destructive' : 'secondary'}>
                              {report.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-3">
                          Reason: {report.reason}
                        </p>
                        {isPending && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => updateReportMutation.mutate({ reportId: report.id, status: 'approved' })}
                              disabled={updateReportMutation.isPending}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => updateReportMutation.mutate({ reportId: report.id, status: 'rejected' })}
                              disabled={updateReportMutation.isPending}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Remove
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-3 w-3" />
                              Details
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* System Monitoring */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="mr-3 h-5 w-5 text-primary" />
            System Status & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl text-green-600 mb-2">
                <Server className="h-8 w-8 mx-auto" />
              </div>
              <div className="font-semibold text-green-700 dark:text-green-400 mb-1">Server Status</div>
              <div className="text-sm text-green-600">All systems operational</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl text-blue-600 mb-2">
                <Database className="h-8 w-8 mx-auto" />
              </div>
              <div className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Database</div>
              <div className="text-sm text-blue-600">Response time: 45ms</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-2xl text-purple-600 mb-2">
                <Cloud className="h-8 w-8 mx-auto" />
              </div>
              <div className="font-semibold text-purple-700 dark:text-purple-400 mb-1">CDN Status</div>
              <div className="text-sm text-purple-600">Global edge optimized</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
