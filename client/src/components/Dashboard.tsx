import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Share2, Inbox, Copy, Trash2, Flag, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) => api.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  const reportMessageMutation = useMutation({
    mutationFn: (messageId: number) => api.createReport(messageId, undefined, "Inappropriate content"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message reported. Thank you for helping keep our community safe.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report message",
        variant: "destructive",
      });
    },
  });

  const copyLink = () => {
    const link = `${window.location.origin}/u/${user?.username}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Success",
      description: "Link copied to clipboard!",
    });
  };

  const shareToSocial = (platform: string) => {
    const link = `${window.location.origin}/u/${user?.username}`;
    const text = 'Send me anonymous messages on Edwards Anonymous!';
    
    let url = '';
    switch(platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      toast({
        title: "Success",
        description: `Shared to ${platform}!`,
      });
    }
  };

  if (!user) return null;

  const messages = (messagesData as any)?.messages || [];
  const unreadCount = messages.filter((msg: any) => !msg.isRead).length;

  return (
    <div className="min-h-screen py-8">
      {/* User Profile Header */}
      <Card className="glass-card mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center mb-6">
            <Avatar className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 mb-4 md:mb-0 md:mr-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, <span className="gradient-text">{user.username}</span>
              </h2>
              <p className="text-muted-foreground">
                Share your link to start receiving anonymous messages
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link Sharing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="mr-3 h-5 w-5 text-primary" />
              Share Your Anonymous Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex rounded-lg overflow-hidden border">
              <Input
                value={`${window.location.origin}/u/${user.username}`}
                readOnly
                className="flex-1 border-0 bg-muted font-mono text-sm"
              />
              <Button onClick={copyLink} className="border-0 rounded-none">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={() => shareToSocial('twitter')} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Twitter
              </Button>
              <Button 
                onClick={() => shareToSocial('facebook')} 
                className="flex-1 bg-blue-800 hover:bg-blue-900"
              >
                Facebook
              </Button>
              <Button 
                onClick={() => shareToSocial('whatsapp')} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Inbox className="mr-3 h-5 w-5 text-primary" />
              Message Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">{messages.length}</div>
              <div className="text-sm text-muted-foreground">Anonymous Messages Received</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Inbox */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Inbox className="mr-3 h-5 w-5 text-primary" />
              Anonymous Messages
              {unreadCount > 0 && (
                <Badge className="ml-2" variant="default">{unreadCount}</Badge>
              )}
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/messages'] })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {messagesLoading ? (
              <div className="text-center text-muted-foreground">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-4">📬</div>
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-sm">Share your link above to start receiving anonymous messages!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message: any) => (
                  <div 
                    key={message.id} 
                    className="p-6 bg-muted rounded-xl border-l-4 border-primary hover:bg-muted/80 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-primary">
                          {message.senderInfo || 'Anonymous Sender'}
                        </span>
                        {!message.isRead && (
                          <Badge className="ml-2" variant="secondary">New</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed mb-4">{message.content}</p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMessageMutation.mutate(message.id)}
                        disabled={deleteMessageMutation.isPending}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reportMessageMutation.mutate(message.id)}
                        disabled={reportMessageMutation.isPending}
                      >
                        <Flag className="mr-1 h-3 w-3" />
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}