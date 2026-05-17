import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ShieldAlert } from 'lucide-react';
import { ConnectButton } from '@mysten/dapp-kit';

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 builder-canvas opacity-40 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border/50 shadow-2xl glass-panel overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/80 to-primary-foreground/80" />
          
          <CardHeader className="text-center pb-4 pt-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 mx-auto flex items-center justify-center mb-4 text-primary">
              <Wallet className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-display font-bold tracking-tight text-foreground">
              Walform Admin Panel
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium mt-2">
              Connect your Sui wallet to manage forms and responses.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-8 pt-2 flex flex-col items-center">
            <div className="w-full flex justify-center">
              <ConnectButton className="!w-full !h-14 !justify-center !text-base !font-bold rounded-full shadow-lg" />
            </div>

            <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-xs text-muted-foreground/90 flex gap-3 items-start leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Security Note:</span> Access is strictly enforced on-chain. Only wallets registered in the <code className="font-mono bg-secondary/60 px-1 rounded">AdminRegistry</code> smart contract are allowed to sync and log in.
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
