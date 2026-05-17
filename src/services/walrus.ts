import { Transaction } from '@mysten/sui/transactions';
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

/**
 * AWS S3 & Sui Integration Service (formerly Walrus Service)
 */

export interface S3Config {
  network: 'testnet' | 'mainnet' | 'devnet' | 'localnet';
  packageId: string;
}

const DEFAULT_CONFIG: S3Config = {
  network: (import.meta.env.VITE_SUI_NETWORK as any) || 'testnet',
  packageId: import.meta.env.VITE_CONTRACT_PACKAGE_ID || '',
};

export class S3Service {
  private config: S3Config;
  private suiClient: SuiJsonRpcClient;

  constructor(config: Partial<S3Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.suiClient = new SuiJsonRpcClient({ 
      url: getJsonRpcFullnodeUrl(this.config.network), 
      network: this.config.network 
    });
  }

  /**
   * Check if a given wallet address is registered as an admin on SUI contract
   */
  async isAdmin(address: string): Promise<boolean> {
    try {
      const registryId = import.meta.env.VITE_ADMIN_REGISTRY_ID;
      if (!registryId) {
        console.warn('VITE_ADMIN_REGISTRY_ID is not configured in .env. Allowing first login for deployment.');
        return true; // Fallback to true if registry is not deployed yet to allow initial configuration
      }

      const response = await this.suiClient.getObject({
        id: registryId,
        options: { showContent: true }
      });
      
      const fields = (response.data?.content as any)?.fields;
      if (!fields || !fields.admins) {
        return false;
      }
      
      return fields.admins.includes(address);
    } catch (e) {
      console.error('Error checking admin status on-chain:', e);
      return false;
    }
  }

  /**
   * Helper to perform safe JSON serialization, stripping circular references and window objects.
   */
  private safeJsonStringify(data: any): string {
    const seen = new WeakSet();
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return; // Suppress circular reference
        }
        seen.add(value);
        if (value === window || value?.constructor?.name === 'Window' || (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement)) {
          return; // Suppress Window / HTML element references
        }
      }
      if (typeof value === 'function') {
        return; // Suppress functions
      }
      return value;
    });
  }

  /**
   * Publishes data to AWS S3 (via secure backend proxy).
   */
  async publishBlob(data: any): Promise<string> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: this.safeJsonStringify(data),
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.blobId;
    } catch (error) {
      console.error('S3 Publish Error:', error);
      throw error;
    }
  }

  /**
   * Retrieves data from AWS S3 (via secure backend proxy).
   */
  async getBlob(blobId: string): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/blob/${blobId}`);
      if (!response.ok) {
         throw new Error('Blob not found');
      }
      return await response.json();
    } catch (error) {
       console.error('S3 Fetch Error:', error);
       throw error;
    }
  }

  /**
   * Updates an existing form definition in S3
   */
  async updateBlob(blobId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/blob/${blobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: this.safeJsonStringify(data),
      });
      if (!response.ok) {
        throw new Error(`S3 update failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('S3 Update Error:', error);
      throw error;
    }
  }

  /**
   * Submits a form response to S3 (no wallet required for public users)
   */
  async submitResponse(formId: string, answers: any): Promise<string> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/form/${formId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: this.safeJsonStringify(answers),
      });

      if (!response.ok) {
        throw new Error(`Response submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.responseId;
    } catch (error) {
      console.error('S3 Response Submit Error:', error);
      throw error;
    }
  }

  /**
   * Fetches all responses for a form from S3
   */
  async getResponses(formId: string): Promise<any[]> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/form/${formId}/responses`);
      if (!response.ok) {
        throw new Error(`Failed to fetch responses: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('S3 Fetch Responses Error:', error);
      return [];
    }
  }

  /**
   * Deletes a form/response from S3
   */
  async deleteBlob(blobId: string): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/blob/${blobId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`S3 delete failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw error;
    }
  }

  /**
   * Creates a transaction to register a form (blob) in the Sui Move contract index
   */
  createIndexTx(blobId: string, name: string, description: string): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.config.packageId}::blob_index::register_blob`,
      arguments: [
        tx.pure.string(blobId),
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.u64(Date.now()),
      ],
    });
    return tx;
  }

  /**
   * Creates a transaction to update indexed form metadata on-chain
   */
  updateIndexTx(metadataObjectId: string, name: string, description: string): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.config.packageId}::blob_index::update_blob`,
      arguments: [
        tx.object(metadataObjectId),
        tx.pure.string(name),
        tx.pure.string(description),
      ],
    });
    return tx;
  }

  /**
   * Creates a transaction to delete/deregister a form from the on-chain index
   */
  deleteIndexTx(metadataObjectId: string): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.config.packageId}::blob_index::delete_blob`,
      arguments: [
        tx.object(metadataObjectId),
      ],
    });
    return tx;
  }

  /**
   * Creates a transaction to register a form response on-chain
   */
  registerResponseTx(formOwner: string, formBlobId: string, responseBlobId: string): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.config.packageId}::blob_index::register_response`,
      arguments: [
        tx.pure.address(formOwner),
        tx.pure.string(formBlobId),
        tx.pure.string(responseBlobId),
        tx.pure.u64(Date.now()),
      ],
    });
    return tx;
  }
}

export const walrus = new S3Service();
