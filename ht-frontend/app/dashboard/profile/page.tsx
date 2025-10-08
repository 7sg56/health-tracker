'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const [name, setName] = useState('Guest');
  const [goal, setGoal] = useState('Stay Healthy');

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      healthGoal: 'maintain',
    },
  });

  // Settings form
  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      notifications: {
        email: true,
        push: true,
        reminders: true,
      },
      privacy: {
        profileVisibility: 'private',
        dataSharing: false,
      },
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
      },
    },
  });

  useEffect(() => {
    const storedName = localStorage.getItem('ht_name');
    const storedGoal = localStorage.getItem('ht_goal');
    if (storedName) setName(storedName);
    if (storedGoal) setGoal(storedGoal);
  }, []);

  const save = () => {
    localStorage.setItem('ht_name', name);
    localStorage.setItem('ht_goal', goal);
  };

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setSaveStatus('error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSaveStatus('error');
        return;
      }

      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setSaveStatus('saving');
      
      // Simulate API call for profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would call an API here
      console.log('Profile data:', data);
      console.log('Avatar file:', avatarFile);
      
      setSaveStatus('success');
      setIsEditing(false);
      
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Profile update failed:', error);
    }
  };

  // Handle settings form submission
  const onSettingsSubmit = async (data: SettingsFormData) => {
    try {
      setSaveStatus('saving');
      
      // Simulate API call for settings update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would call an API here
      console.log('Settings data:', data);
      
      setSaveStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Settings update failed:', error);
    }
  };


  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
          {saveStatus === 'success' && (
            <Alert className="w-auto border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Changes saved successfully!
              </AlertDescription>
            </Alert>
          )}
          {saveStatus === 'error' && (
            <Alert className="w-auto border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                Failed to save changes. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enhanced Profile Overview Card with Avatar Upload */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                  <AvatarImage 
                    src={avatarPreview || undefined} 
                    alt={`${user?.username || 'User'}'s avatar`} 
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                    {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold">
                  {user?.username || 'User'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'No email provided'}
                </p>
                <Badge variant="secondary" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Stay Healthy
                </Badge>
              </div>
              <div className="flex gap-2 w-full">
                <Button 
                  variant={isEditing ? "secondary" : "outline"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Account Information with Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update your profile information' : 'Your basic profile and account details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>Username</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="healthGoal"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="flex items-center space-x-2">
                              <Target className="w-4 h-4" />
                              <span>Health Goal</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your health goal" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {healthGoalOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us a bit about yourself and your health journey..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional. Share your health journey or goals (max 500 characters).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        disabled={saveStatus === 'saving'}
                        className="flex-1"
                      >
                        {saveStatus === 'saving' ? (
                          <>
                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Username</span>
                      </Label>
                      <Input 
                        value={user?.username ?? ''} 
                        readOnly 
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </Label>
                      <Input 
                        type="email" 
                        value={user?.email ?? ''} 
                        readOnly 
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Member Since</span>
                      </Label>
                      <Input 
                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
                        readOnly 
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Account Status</span>
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
       
   {/* Enhanced Settings Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Settings & Preferences</span>
              </CardTitle>
              <CardDescription>
                Customize your app experience and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-8">
                  {/* Notifications Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-yellow-500" />
                      <h4 className="text-sm font-medium">Notifications</h4>
                    </div>
                    <div className="space-y-4 pl-6">
                      <FormField
                        control={settingsForm.control}
                        name="notifications.email"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Email Notifications</FormLabel>
                              <FormDescription className="text-xs">
                                Receive updates and reminders via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="notifications.push"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Push Notifications</FormLabel>
                              <FormDescription className="text-xs">
                                Get instant notifications on your device
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="notifications.reminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Health Reminders</FormLabel>
                              <FormDescription className="text-xs">
                                Daily reminders for water, meals, and workouts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Privacy Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      <h4 className="text-sm font-medium">Privacy</h4>
                    </div>
                    <div className="space-y-4 pl-6">
                      <FormField
                        control={settingsForm.control}
                        name="privacy.profileVisibility"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-medium">Profile Visibility</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="public"
                                    value="public"
                                    checked={field.value === 'public'}
                                    onChange={() => field.onChange('public')}
                                    className="w-4 h-4"
                                  />
                                  <Label htmlFor="public" className="text-sm flex items-center space-x-1">
                                    <Globe className="w-3 h-3" />
                                    <span>Public</span>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="private"
                                    value="private"
                                    checked={field.value === 'private'}
                                    onChange={() => field.onChange('private')}
                                    className="w-4 h-4"
                                  />
                                  <Label htmlFor="private" className="text-sm flex items-center space-x-1">
                                    <Lock className="w-3 h-3" />
                                    <span>Private</span>
                                  </Label>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs">
                              Control who can see your profile and health data
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="privacy.dataSharing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Anonymous Data Sharing</FormLabel>
                              <FormDescription className="text-xs">
                                Help improve the app by sharing anonymous usage data
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Preferences Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-purple-500" />
                      <h4 className="text-sm font-medium">Preferences</h4>
                    </div>
                    <div className="space-y-4 pl-6">
                      <FormField
                        control={settingsForm.control}
                        name="preferences.theme"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-medium">Theme</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="light"
                                    value="light"
                                    checked={field.value === 'light'}
                                    onChange={() => field.onChange('light')}
                                    className="w-4 h-4"
                                  />
                                  <Label htmlFor="light" className="text-sm flex items-center space-x-1">
                                    <Sun className="w-3 h-3" />
                                    <span>Light</span>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="dark"
                                    value="dark"
                                    checked={field.value === 'dark'}
                                    onChange={() => field.onChange('dark')}
                                    className="w-4 h-4"
                                  />
                                  <Label htmlFor="dark" className="text-sm flex items-center space-x-1">
                                    <Moon className="w-3 h-3" />
                                    <span>Dark</span>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="system"
                                    value="system"
                                    checked={field.value === 'system'}
                                    onChange={() => field.onChange('system')}
                                    className="w-4 h-4"
                                  />
                                  <Label htmlFor="system" className="text-sm">System</Label>
                                </div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={settingsForm.control}
                          name="preferences.language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languageOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="preferences.timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Timezone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timezoneOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={saveStatus === 'saving'}
                      className="flex-1"
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-500" />
                <span>Account Actions</span>
              </CardTitle>
              <CardDescription>
                Manage your account data and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button variant="outline" disabled className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" disabled className="flex-1">
                  <Lock className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                <Button variant="destructive" disabled className="flex-1">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                These features are coming soon. Contact support if you need immediate assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}