'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = useState('Sourish Ghosh');
  const [goal, setGoal] = useState('Stay Healthy');
  const [saved, setSaved] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    const storedName = localStorage.getItem('ht_name');
    const storedGoal = localStorage.getItem('ht_goal');
    if (storedName) setName(storedName);
    if (storedGoal) setGoal(storedGoal);
  }, []);

  const save = () => {
    localStorage.setItem('ht_name', name);
    localStorage.setItem('ht_goal', goal);
    setSaved('success');
    setTimeout(() => setSaved('idle'), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Update your display name and health goal.
        </p>
      </div>

      {saved === 'success' && (
        <Alert className="w-auto border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Changes saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Health goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select your health goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stay Healthy">Stay Healthy</SelectItem>
                <SelectItem value="Lose Weight">Lose Weight</SelectItem>
                <SelectItem value="Gain Muscle">Gain Muscle</SelectItem>
                <SelectItem value="Improve Performance">
                  Improve Performance
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button onClick={save} className="w-full sm:w-auto">
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
