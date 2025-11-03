// components/UserEmailDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/Dialog';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Label } from '@/components/Label';
import { getUserEmail, setUserEmail, hasUserEmail } from '@/lib/user-store';
import { Mail } from 'lucide-react';

export function UserEmailDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmailState] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasUserEmail()) {
      setOpen(true);
    }
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setUserEmail(email);
    setError('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Welcome to VANTAGE.AI
          </DialogTitle>
          <DialogDescription>
            Enter your email to get started. This helps us track your analyses.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => {
                setEmailState(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button onClick={handleSave} disabled={!email.trim()} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}