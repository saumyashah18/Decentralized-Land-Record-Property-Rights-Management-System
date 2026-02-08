import { Gateway, Wallets } from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.resolve(__dirname, '..', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const gateway = new Gateway();
        console.log('Connecting to gateway...');
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true }
        });
        console.log('✅ Connected to gateway');

        const network = await gateway.getNetwork('mychannel');
        console.log('✅ Got network');

        const contract = network.getContract('landregistry');
        console.log('✅ Got contract');

        console.log('Evaluating transaction...');
        // Correct method name from ParcelContract
        const result = await contract.evaluateTransaction('ParcelExists', 'P001');
        console.log(`✅ Success! Result: ${result.toString()}`);

        await gateway.disconnect();
    } catch (error) {
        console.error(`❌ Failed to test Fabric: ${error}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

