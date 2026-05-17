import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
import App from './App.tsx';
import './index.css';
import '@mysten/dapp-kit/dist/index.css';

import { JsonRpcHTTPTransport, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

const queryClient = new QueryClient();
const { networkConfig } = createNetworkConfig({
	testnet: {
		transport: new JsonRpcHTTPTransport({ url: getJsonRpcFullnodeUrl('testnet') }),
		network: 'testnet',
	},
	mainnet: {
		transport: new JsonRpcHTTPTransport({ url: getJsonRpcFullnodeUrl('mainnet') }),
		network: 'mainnet',
	},
});

const defaultNetwork = (import.meta.env.VITE_SUI_NETWORK === 'mainnet') ? 'mainnet' : 'testnet';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
				<WalletProvider autoConnect>
					<App />
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	</StrictMode>,
);
