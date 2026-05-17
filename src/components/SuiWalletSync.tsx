import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { walrus } from '../services/walrus';
import { toast } from 'sonner';

export function SuiWalletSync() {
  const account = useCurrentAccount();
  const setUser = useAuthStore((state) => state.setUser);
  const { mutate: disconnect } = useDisconnectWallet();

  useEffect(() => {
    let active = true;

    async function checkAdminAndSync() {
      if (account) {
        // Query the SUI blockchain to see if they are in the AdminRegistry
        const adminStatus = await walrus.isAdmin(account.address);
        
        if (!active) return;

        if (adminStatus) {
          setUser({
            id: account.address,
            address: account.address,
          });
          toast.success('Admin authorized!', {
            description: `Successfully signed in as admin: ${account.address.slice(0, 6)}...${account.address.slice(-4)}`
          });
        } else {
          // Trigger disconnect and show alert
          disconnect();
          setUser(null);
          toast.error('Access Denied!', {
            description: 'This wallet address is not registered as an Admin on the Sui blockchain.',
            duration: 10000
          });
        }
      } else {
        setUser(null);
      }
    }

    checkAdminAndSync();

    return () => {
      active = false;
    };
  }, [account, setUser, disconnect]);

  return null;
}
