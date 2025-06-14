import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Shield, Users, MessageCircle, Flag, Server, Database, Cloud, RefreshCw, Eye, UserX, CheckCircle, XCircle, Settings, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SiteSettingsForm } from "./SiteSettingsForm";

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

  const stats = (statsData as any)?.stats || {};
  const users = (usersData as any)?.users || [];
  const reports = (reportsData as any)?.reports || [];

  return (
    <div className="min-h-screen py-4 px-4 md:py-8">
      {/* Admin Header */}
      <Card className="glass-card mb-6 md:mb-8">
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold gradient-text flex items-center">
              <Shield className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
              Admin Dashboard
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <span className="text-sm text-muted-foreground">
                Last updated: Just now
              </span>
              <Button onClick={refreshDashboard} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <Card className="glass-card text-center hover:scale-105 transition-transform duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
              {statsLoading ? '---' : stats.totalUsers || 0}
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Users</div>
            <div className="text-xs text-green-600">+127 this week</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card text-center hover:scale-105 transition-transform duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
              {statsLoading ? '---' : stats.activeUsers || 0}
            </div>
            <div className="text-sm text-muted-foreground mb-1">Active Users</div>
            <div className="text-xs text-green-600">+45 today</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card text-center hover:scale-105 transition-transform duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">
              {statsLoading ? '---' : stats.totalMessages || 0}
            </div>
            <div className="text-sm text-muted-foreground mb-1">Messages</div>
            <div className="text-xs text-green-600">+1,234 today</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card text-center hover:scale-105 transition-transform duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-red-600 mb-2">
              {reportsLoading ? '---' : reports.filter((r: any) => r.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground mb-1">Reports</div>
            <div className="text-xs text-yellow-600">Needs attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 md:mb-8">
          <TabsTrigger value="users" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Flag className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Settings className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Server className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Users className="mr-2 md:mr-3 h-5 w-5 text-primary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 md:h-96">
                {usersLoading ? (
                  <div className="text-center text-muted-foreground py-8">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No users found</div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {users.map((user: any) => (
                      <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-muted rounded-lg gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs md:text-sm">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm md:text-base">{user.username}</div>
                            <div className="text-xs md:text-sm text-muted-foreground">
                              {user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Joined: {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={deleteUserMutation.isPending}
                            className="text-xs"
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
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Flag className="mr-2 md:mr-3 h-5 w-5 text-primary" />
                Content Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 md:h-96">
                {reportsLoading ? (
                  <div className="text-center text-muted-foreground py-8">Loading reports...</div>
                ) : reports.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No reports found</div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {reports.map((report: any) => (
                      <div key={report.id} className="p-3 md:p-4 bg-muted rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                                {report.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">Reason: {report.reason}</p>
                            {report.reporterUsername && (
                              <p className="text-xs text-muted-foreground mb-2">
                                Reported by: {report.reporterUsername} ({report.reporterEmail})
                              </p>
                            )}
                            {report.messageContent && (
                              <p className="text-xs bg-red-50 dark:bg-red-950 p-2 rounded">
                                Message: "{report.messageContent}"
                              </p>
                            )}
                            {report.chatMessageContent && (
                              <p className="text-xs bg-red-50 dark:bg-red-950 p-2 rounded">
                                Chat: "{report.chatMessageContent}"
                              </p>
                            )}
                          </div>
                          {report.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReportMutation.mutate({ reportId: report.id, status: 'reviewed' })}
                                disabled={updateReportMutation.isPending}
                                className="text-xs"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateReportMutation.mutate({ reportId: report.id, status: 'rejected' })}
                                disabled={updateReportMutation.isPending}
                                className="text-xs"
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SiteSettingsForm />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Server className="mr-2 md:mr-3 h-5 w-5 text-primary" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Database Status</span>
                    <Badge variant="secondary" className="text-xs">Connected</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Server Status</span>
                    <Badge variant="secondary" className="text-xs">Online</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Version: 2.0.0
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Environment: Production
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}