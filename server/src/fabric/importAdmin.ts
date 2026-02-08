import { Wallets } from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    try {
        // Path to wallet
        const walletPath = path.join(__dirname, '..', '..', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Paths to credentials
        const credPath = path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'users', 'Admin@org1.example.com', 'msp');
        const certPath = path.join(credPath, 'signcerts');
        const keyPath = path.join(credPath, 'keystore');

        // Find the certificate file
        const certFiles = fs.readdirSync(certPath);
        const certFile = certFiles.find(f => f.endsWith('.pem'));

        // Find the private key file
        const keyFiles = fs.readdirSync(keyPath);
        const keyFile = keyFiles.find(f => f.endsWith('_sk'));

        if (!certFile || !keyFile) {
            console.error(`Credentials not found at ${credPath}`);
            process.exit(1);
        }

        const cert = fs.readFileSync(path.join(certPath, certFile)).toString();
        const key = fs.readFileSync(path.join(keyPath, keyFile)).toString();

        const x509Identity = {
            credentials: {
                certificate: cert,
                privateKey: key,
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        await wallet.put('admin', x509Identity);
        console.log('✅ Successfully imported Admin identity into the wallet');

    } catch (error) {
        console.error(`❌ Failed to import admin: ${error}`);
        process.exit(1);
    }
}

main();
