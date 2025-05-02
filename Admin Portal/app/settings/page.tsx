"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { updateEmail } from "firebase/auth";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    email: "",
    companyName: "",
    address: "",
    taxId: "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    stockAlerts: true,
  });

  // Fetch user profile data and notification settings on mount
  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch("http://localhost:4000/api/user-profile", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProfileData({
            email: user.email || "",
            companyName: data.companyName || "",
            address: data.address || "",
            taxId: data.taxId || "",
          });
        } else {
          throw new Error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      }
    };

    const fetchNotificationSettings = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch("http://localhost:4000/api/notification-settings", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotificationSettings({
            emailNotifications: data.emailNotifications ?? true,
            pushNotifications: data.pushNotifications ?? true,
            weeklyReports: data.weeklyReports ?? true,
            stockAlerts: data.stockAlerts ?? true,
          });
        } else {
          throw new Error("Failed to fetch notification settings");
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        toast({
          title: "Error",
          description: "Failed to load notification settings.",
          variant: "destructive",
        });
      }
    };

    fetchProfileData();
    fetchNotificationSettings();
  }, [user, toast]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      // Validate email
      if (!profileData.email) {
        throw new Error("Email cannot be empty");
      }

      // Update email in Firebase if it has changed
      if (profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
        console.log("Email updated in Firebase");
      }

      // Update other profile data on the server
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:4000/api/user-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: profileData.email,
          companyName: profileData.companyName,
          address: profileData.address,
          taxId: profileData.taxId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:4000/api/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(notificationSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update notification settings");
      }

      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Notification update error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account information and company details.</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Company Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={profileData.taxId}
                      onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you want to receive notifications.</CardDescription>
              </CardHeader>
              <form onSubmit={handleNotificationUpdate}>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications in the browser</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weeklyReports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                    </div>
                    <Switch
                      id="weeklyReports"
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, weeklyReports: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="stockAlerts">Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when inventory is running low</p>
                    </div>
                    <Switch
                      id="stockAlerts"
                      checked={notificationSettings.stockAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, stockAlerts: checked })
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}