import * as path from 'path';
import * as fs from 'fs';

/**
 * Returns a mock Fabric Gateway and Contract for environments where Fabric is unavailable (e.g., Vercel)
 */
function getMockFabricGateway() {
    console.log('⚠️  Using Mock Fabric Gateway (Vercel Environment)');
    return {
        gateway: {
            disconnect: () => { console.log('[MOCK] Fabric Gateway disconnected'); },
            getNetwork: async () => ({
                getContract: (name: string) => ({
                    submitTransaction: async (fn: string, ...args: any[]) => {
                        console.log(`[MOCK] Fabric submitTransaction: ${fn}(${args.join(', ')})`);
                        return Buffer.from('mock-tx-id');
                    },
                    evaluateTransaction: async (fn: string, ...args: any[]) => {
                        console.log(`[MOCK] Fabric evaluateTransaction: ${fn}(${args.join(', ')})`);
                        return Buffer.from(JSON.stringify({ mock: true, status: 'simulated' }));
                    }
                })
            })
        },
        contract: {
            submitTransaction: async (fn: string, ...args: any[]) => {
                console.log(`[MOCK] Fabric submitTransaction: ${fn}(${args.join(', ')})`);
                return Buffer.from('mock-tx-id');
            },
            evaluateTransaction: async (fn: string, ...args: any[]) => {
                console.log(`[MOCK] Fabric evaluateTransaction: ${fn}(${args.join(', ')})`);
                return Buffer.from(JSON.stringify({ mock: true, status: 'simulated' }));
            }
        }
    };
}

export async function getFabricContract(
    channelName: string,
    chaincodeName: string,
    smartContractName: string | undefined,
    userName: string
): Promise<{ gateway: any; contract: any }> {
    // If running on Vercel, return mocks to avoid importing broken fabric-network modules
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        return getMockFabricGateway();
    }

    try {
        // Dynamic import to avoid loading fabric-network on app boot
        const { Gateway, Wallets } = await import('fabric-network');

        // Load connection profile
        const ccpPath = process.env.FABRIC_CCP_PATH || path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');

        if (!fs.existsSync(ccpPath)) {
            console.warn('Fabric connection profile not found. Falling back to Mock.');
            return getMockFabricGateway();
        }

        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Load wallet
        const walletPath = path.resolve(__dirname, '..', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if user exists in wallet
        const identity = await wallet.get(userName);
        if (!identity) {
            console.warn(`An identity for the user ${userName} does not exist in the wallet. Falling back to Mock.`);
            return getMockFabricGateway();
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: userName,
            discovery: { enabled: true, asLocalhost: true }
        });

        console.log('✅ Fabric Gateway is working (Identity: ' + userName + ')');

        // Get the network (channel) our contract is deployed to.
        const network: any = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract: any = smartContractName
            ? network.getContract(chaincodeName, smartContractName)
            : network.getContract(chaincodeName);

        return { gateway, contract };
    } catch (error) {
        console.error('Failed to connect to Fabric, using fallback mock:', error);
        return getMockFabricGateway();
    }
}
