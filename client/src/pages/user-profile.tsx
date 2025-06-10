import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [senderInfo, setSenderInfo] = useState("");

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/users', username],
    queryFn: () => api.getUserByUsername(username!),
    enabled: !!username,
  });

  const sendMessageMutation = useMutation({
    mutationFn: () => api.sendMessage(userData.user.id, message, senderInfo || undefined),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your anonymous message has been sent!",
      });
      setMessage("");
      setSenderInfo("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Loading...</div>
          <div className="text-muted-foreground">Finding user profile</div>
        </div>
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🤔</div>
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The user "{username}" doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = userData.user;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* User Profile Header */}
        <Card className="glass-card mb-8">
          <CardContent className="p-8 text-center">
            <Avatar className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 mx-auto mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold gradient-text mb-2">{user.username}</h1>
            <p className="text-muted-foreground mb-4">
              Send an anonymous message to {user.username}
            </p>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <MessageCircle className="mr-2 h-4 w-4" />
              Anonymous messaging enabled
            </div>
          </CardContent>
        </Card>

        {/* Send Message Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="mr-3 h-5 w-5 text-primary" />
              Send Anonymous Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senderInfo">Anonymous Name (Optional)</Label>
                <Input
                  id="senderInfo"
                  value={senderInfo}
                  onChange={(e) => setSenderInfo(e.target.value)}
                  placeholder="e.g., Your Secret Admirer, A Friend, Anonymous..."
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to send completely anonymously, or add a fun nickname
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Your Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your anonymous message here... Be kind and respectful!"
                  rows={6}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/1000 characters
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg border border-dashed border-primary/30">
                <h4 className="font-medium mb-2 text-sm">🛡️ Privacy Notice</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Your identity remains completely anonymous</li>
                  <li>• No personal information is collected or stored</li>
                  <li>• Messages are encrypted and secure</li>
                  <li>• Be respectful and follow community guidelines</li>
                </ul>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Anonymous Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Edwards Anonymous
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
