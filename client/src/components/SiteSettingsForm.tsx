import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Upload, Save } from "lucide-react";

export function SiteSettingsForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Fetch site settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['/api/site-settings'],
  });

  const settings = (settingsData as any)?.settings;

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { siteName: string; footerText: string; logoUrl?: string }) => {
      return apiRequest({
        url: '/api/admin/site-settings',
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      toast({
        title: "Success",
        description: "Site settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update site settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let logoUrl = settings?.logoUrl;
    
    // Handle logo upload (simplified - in production you'd upload to a file service)
    if (logoFile) {
      logoUrl = URL.createObjectURL(logoFile);
    }

    updateSettingsMutation.mutate({
      siteName: formData.get('siteName') as string,
      footerText: formData.get('footerText') as string,
      logoUrl,
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading site settings...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Site Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              name="siteName"
              defaultValue={settings?.siteName || "My Site"}
              placeholder="Enter site name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              name="footerText"
              defaultValue={settings?.footerText || "© 2024 My Site. All rights reserved."}
              placeholder="Enter footer text"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Site Logo</Label>
            <div className="flex items-center gap-4">
              {settings?.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt="Current logo"
                  className="h-12 w-12 object-contain border rounded"
                />
              )}
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a new logo image (JPG, PNG, SVG)
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateSettingsMutation.isPending ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}