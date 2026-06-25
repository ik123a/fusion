"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Shield,
  Key,
  Palette,
  Check,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

type TabId = "profile" | "notifications" | "security" | "api-keys" | "appearance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Notifications State
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [taskAssign, setTaskAssign] = useState(true);
  const [deployAlert, setDeployAlert] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Security State
  const [twoFactor, setTwoFactor] = useState(false);

  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    { id: "key-1", name: "Production Gateway", key: "sk_live_51Nv...a8f2", created: "2024-03-10", lastUsed: "2 hours ago", show: false },
    { id: "key-2", name: "Staging SDK", key: "sk_test_51Nv...4b1c", created: "2024-03-15", lastUsed: "Yesterday", show: false },
  ]);
  const [newKeyName, setNewKeyName] = useState("");

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleToggleShowKey = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, show: !k.show } : k));
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast.success("API key revoked");
  };

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `sk_${Math.random() > 0.5 ? "live" : "test"}_${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 6)}`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      show: false,
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    toast.success("API key generated successfully");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile, keys, notifications, and security preferences</p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none border-b border-border/40 md:border-b-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap focus:outline-none ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 glow-primary border-l-2 border-indigo-500 md:border-l-2"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your personal information and avatar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6 pb-2">
                      <div className="relative group">
                        <Avatar size="lg" fallback="U" className="h-20 w-20 ring-4 ring-indigo-500/20" />
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <span className="text-[10px] text-white font-medium">Edit</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 shadow-md">Change Avatar</Button>
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
                      </div>
                    </div>

                    <Separator className="border-border/40" />

                    {/* Form Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input id="fullname" defaultValue="Alex Rivera" className="bg-secondary/35 border-border/40 focus:border-indigo-500" />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="arivera" className="bg-secondary/35 border-border/40 focus:border-indigo-500" />
                      </div>
                      <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="alex@fusion.dev" className="bg-secondary/35 border-border/40 focus:border-indigo-500" />
                      </div>
                      <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          rows={4}
                          defaultValue="Staff Software Engineer building the next-gen collaborative developer experience at Fusion."
                          className="flex w-full rounded-md border border-border/40 bg-secondary/35 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-indigo-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => toast.success("Profile saved successfully")} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "notifications" && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Configure how and when you receive platform alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-border/30">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">Receive workspace summaries and activity reports</p>
                        </div>
                        <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-border/30">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Push Notifications</Label>
                          <p className="text-xs text-muted-foreground">Real-time push alerts on task status changes</p>
                        </div>
                        <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-border/30">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Task Assignments</Label>
                          <p className="text-xs text-muted-foreground">Get notified when a new task is assigned to you</p>
                        </div>
                        <Switch checked={taskAssign} onCheckedChange={setTaskAssign} />
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-border/30">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Deployment Alerts</Label>
                          <p className="text-xs text-muted-foreground">Notifications for failed builds and successful promotions</p>
                        </div>
                        <Switch checked={deployAlert} onCheckedChange={setDeployAlert} />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Weekly Analytics Digest</Label>
                          <p className="text-xs text-muted-foreground">A clean summary of your team's weekly velocity</p>
                        </div>
                        <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => toast.success("Notification preferences saved")} className="bg-indigo-600 hover:bg-indigo-500">
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "security" && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Secure your account with two-factor authentication and passwords</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 2FA Card */}
                    <div className="rounded-lg border border-border/40 bg-secondary/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-semibold">Two-Factor Authentication (2FA)</h4>
                          <p className="text-xs text-muted-foreground">Add an extra layer of protection using an authenticator app</p>
                        </div>
                        <Button
                          variant={twoFactor ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => {
                            setTwoFactor(!twoFactor);
                            toast.success(`2FA successfully ${!twoFactor ? "enabled" : "disabled"}`);
                          }}
                        >
                          {twoFactor ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>

                    <Separator className="border-border/40" />

                    {/* Change Password Form */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">Change Password</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-1.5 sm:col-span-2">
                          <Label htmlFor="curr-pass">Current Password</Label>
                          <Input id="curr-pass" type="password" className="bg-secondary/35 border-border/40 focus:border-indigo-500" />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="new-pass">New Password</Label>
                          <Input id="new-pass" type="password" className="bg-secondary/35 border-border/40 focus:border-indigo-500" />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="confirm-pass">Confirm Password</Label>
                          <Input id="confirm-pass" type="password" className="bg-secondary/35 border-border/40 focus:border-indigo-500" />
                        </div>
                      </div>
                    </div>

                    <Separator className="border-border/40" />

                    {/* Active Sessions */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">Active Sessions</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-border/30 p-3 bg-secondary/10">
                          <div className="flex items-center gap-3">
                            <Laptop className="h-5 w-5 text-indigo-400" />
                            <div>
                              <p className="text-sm font-medium">macOS • Chrome Web Browser</p>
                              <p className="text-xs text-muted-foreground">San Francisco, CA • IP: 192.168.1.45 • Current Session</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">Active</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border/30 p-3 bg-secondary/10">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">iPhone 15 Pro • Safari Mobile</p>
                              <p className="text-xs text-muted-foreground">San Francisco, CA • IP: 172.56.21.9 • 3 hours ago</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">Revoke</Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => toast.success("Password updated successfully")} className="bg-indigo-600 hover:bg-indigo-500">
                        Update Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "api-keys" && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>API Access Keys</CardTitle>
                    <CardDescription>Generate and manage secure API keys for programmatically interacting with Fusion services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key generator bar */}
                    <div className="flex items-end gap-3 bg-secondary/20 p-4 rounded-lg border border-border/40">
                      <div className="grid gap-1.5 flex-1">
                        <Label htmlFor="key-name">Key Name</Label>
                        <Input
                          id="key-name"
                          placeholder="e.g. CLI tool client"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="bg-background border-border/40 focus:border-indigo-500"
                        />
                      </div>
                      <Button onClick={handleGenerateKey} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md gap-1.5">
                        <Plus className="h-4 w-4" />
                        Generate Key
                      </Button>
                    </div>

                    {/* Keys list */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">Active Keys</h4>
                      {apiKeys.length > 0 ? (
                        <div className="space-y-3">
                          {apiKeys.map((k) => (
                            <div key={k.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border border-border/30 rounded-lg bg-secondary/10">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">{k.name}</p>
                                <div className="flex items-center gap-2">
                                  <code className="font-mono text-xs text-muted-foreground bg-black/35 px-1.5 py-0.5 rounded border border-border/30">
                                    {k.show ? k.key : "sk_••••••••••••••••••••••••"}
                                  </code>
                                  <button onClick={() => handleToggleShowKey(k.id)} className="text-muted-foreground hover:text-foreground">
                                    {k.show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                  </button>
                                  <button onClick={() => handleCopyKey(k.key)} className="text-muted-foreground hover:text-foreground">
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  Created on {k.created} • Last used {k.lastUsed}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteKey(k.id)}
                                className="text-xs border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive self-end sm:self-center"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg border-border/40">
                          No active API keys found. Generate one above to get started.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "appearance" && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Appearance Customizer</CardTitle>
                    <CardDescription>Personalize the workspace theme, typography, and code editors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Theme selector */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Interface Theme</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="relative cursor-pointer group rounded-lg border-2 border-indigo-500 bg-secondary/35 p-4 flex flex-col items-center gap-2">
                          <div className="h-10 w-full rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <span className="text-[10px] text-slate-400">Dark Mode</span>
                          </div>
                          <span className="text-xs font-semibold">Dark Theme</span>
                          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white"><Check className="h-3 w-3" /></span>
                        </div>
                        <div onClick={() => toast.info("System matches dark configuration in local env")} className="cursor-pointer group rounded-lg border border-border/40 hover:border-indigo-500/40 bg-secondary/15 p-4 flex flex-col items-center gap-2 transition-all">
                          <div className="h-10 w-full rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <span className="text-[10px] text-slate-700">Light Mode</span>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Light Theme</span>
                        </div>
                        <div onClick={() => toast.info("Active theme: Dark default")} className="cursor-pointer group rounded-lg border border-border/40 hover:border-indigo-500/40 bg-secondary/15 p-4 flex flex-col items-center gap-2 transition-all">
                          <div className="h-10 w-full rounded bg-gradient-to-r from-slate-900 to-slate-200 border border-border/30 flex items-center justify-center">
                            <span className="text-[10px] text-slate-500">Auto</span>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">System Match</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="border-border/40" />

                    {/* Font size */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Workspace Font Size</Label>
                      <div className="flex gap-2">
                        {["Small (12px)", "Medium (14px)", "Large (16px)"].map((font, idx) => (
                          <Button
                            key={idx}
                            variant={idx === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => toast.success(`Font size configured to: ${font}`)}
                            className={idx === 1 ? "bg-indigo-600 hover:bg-indigo-500" : "border-border/40 hover:bg-secondary/40"}
                          >
                            {font}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator className="border-border/40" />

                    {/* Editor theme drop-down */}
                    <div className="grid gap-2 max-w-sm">
                      <Label className="text-sm font-semibold">Code Editor Theme</Label>
                      <Select defaultValue="vs-dark">
                        <SelectTrigger className="bg-secondary/35 border-border/40">
                          <SelectValue placeholder="Select Monaco Theme" />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          <SelectItem value="vs-dark">VS Dark (Default)</SelectItem>
                          <SelectItem value="monokai">Monokai Pro</SelectItem>
                          <SelectItem value="github-dark">GitHub Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
