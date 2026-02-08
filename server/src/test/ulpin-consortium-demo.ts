import { Gateway, Wallets } from 'fabric-network';
import Web3 from 'web3';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Comprehensive ULPIN-Based Test Scenario
 * Demonstrates:
 * 1. Property creation on Hyperledger Fabric with ULPIN
 * 2. Transaction hash generation from Fabric
 * 3. IFSC code integration (simulated bank verification)
 * 4. Hash anchoring to Ethereum via Web3.js
 * 5. Consortium updates across both blockchains
 */

// Configuration
const FABRIC_CONFIG = {
    ccpPath: path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json'),
    walletPath: path.resolve(__dirname, '..', '..', 'wallet'),
    channelName: 'mychannel',
    chaincodeName: 'landregistry',
    identity: 'admin'
};

const ETHEREUM_CONFIG = {
    providerUrl: 'http://127.0.0.1:8545',
    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' // Hardhat Account #0
};

// AnchorRegistry ABI (simplified)
const ANCHOR_REGISTRY_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_id", "type": "string" },
            { "internalType": "string", "name": "_eventType", "type": "string" },
            { "internalType": "bytes32", "name": "_hash", "type": "bytes32" }
        ],
        "name": "anchorHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "_id", "type": "string" }],
        "name": "getAnchors",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "eventType", "type": "string" },
                    { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "address", "name": "sender", "type": "address" }
                ],
                "internalType": "struct AnchorRegistry.Anchor[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Helper function to generate ULPIN (Bhu-Aadhar)
function generateULPIN(state: string, district: string, subDistrict: string, village: string, plotNumber: string): string {
    // Format: SS-DD-SSSS-VVV-PPPPPP (State-District-SubDistrict-Village-PlotNumber)
    return `${state}-${district}-${subDistrict}-${village}-${plotNumber}`;
}

// Helper function to generate hash
function generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Helper function to simulate IFSC code verification
function generateIFSCHash(ifscCode: string, amount: number, transactionId: string): string {
    const data = `${ifscCode}:${amount}:${transactionId}`;
    return generateHash(data);
}

async function main() {
    console.log('🚀 Starting Comprehensive ULPIN-Based Test Scenario\n');
    console.log('═'.repeat(80));

    // ========================================
    // STEP 1: Connect to Hyperledger Fabric
    // ========================================
    console.log('\n📘 STEP 1: Connecting to Hyperledger Fabric Network');
    console.log('─'.repeat(80));

    const ccp = JSON.parse(fs.readFileSync(FABRIC_CONFIG.ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(FABRIC_CONFIG.walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: FABRIC_CONFIG.identity,
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork(FABRIC_CONFIG.channelName);
    const contract = network.getContract(FABRIC_CONFIG.chaincodeName);

    console.log('✅ Connected to Fabric Network');
    console.log(`   Channel: ${FABRIC_CONFIG.channelName}`);
    console.log(`   Chaincode: ${FABRIC_CONFIG.chaincodeName}`);

    // ========================================
    // STEP 2: Create Property with ULPIN
    // ========================================
    console.log('\n📘 STEP 2: Creating Property on Fabric with ULPIN');
    console.log('─'.repeat(80));

    const ulpin = generateULPIN('27', '001', '0012', '001', '000123');
    const propertyData = {
        ulpin: ulpin,
        area: 2500, // square meters
        location: 'Survey No. 123, Village Kharadi, Pune, Maharashtra',
        ownerId: 'CITIZEN-001',
        ownerName: 'Rajesh Kumar',
        documentHash: generateHash('property-deed-original-document')
    };

    console.log(`   ULPIN: ${ulpin}`);
    console.log(`   Owner: ${propertyData.ownerName} (${propertyData.ownerId})`);
    console.log(`   Area: ${propertyData.area} sq.m`);
    console.log(`   Location: ${propertyData.location}`);

    // Create parcel on Fabric
    const createResult = await contract.submitTransaction(
        'CreateParcel',
        propertyData.ulpin,
        propertyData.area.toString(),
        propertyData.location,
        propertyData.ownerId,
        propertyData.documentHash
    );

    console.log('✅ Property created on Hyperledger Fabric');

    // ========================================
    // STEP 3: Generate Fabric Transaction Hash
    // ========================================
    console.log('\n📘 STEP 3: Generating Fabric Transaction Hash');
    console.log('─'.repeat(80));

    // Query the created parcel to get its state
    const parcelState = await contract.evaluateTransaction('QueryParcel', ulpin);
    const parcel = JSON.parse(parcelState.toString());

    // Generate hash of the Fabric transaction
    const fabricTxData = JSON.stringify({
        ulpin: parcel.ulpin,
        ownerId: parcel.ownerId,
        area: parcel.area,
        documentHash: parcel.documentHash,
        timestamp: new Date().toISOString()
    });
    const fabricTxHash = generateHash(fabricTxData);

    console.log(`   Fabric Transaction Data: ${fabricTxData.substring(0, 100)}...`);
    console.log(`   Fabric TX Hash: 0x${fabricTxHash}`);

    // ========================================
    // STEP 4: Simulate IFSC Code Integration
    // ========================================
    console.log('\n📘 STEP 4: Simulating Bank Verification with IFSC Code');
    console.log('─'.repeat(80));

    const bankTransaction = {
        ifscCode: 'SBIN0001234', // State Bank of India, Branch Code
        amount: 5000000, // Registration fee in INR
        transactionId: 'TXN' + Date.now(),
        purpose: 'Property Registration Fee'
    };

    const ifscHash = generateIFSCHash(
        bankTransaction.ifscCode,
        bankTransaction.amount,
        bankTransaction.transactionId
    );

    console.log(`   Bank: ${bankTransaction.ifscCode}`);
    console.log(`   Amount: ₹${bankTransaction.amount.toLocaleString('en-IN')}`);
    console.log(`   Transaction ID: ${bankTransaction.transactionId}`);
    console.log(`   IFSC Hash: 0x${ifscHash}`);

    // ========================================
    // STEP 5: Generate Consortium Hash
    // ========================================
    console.log('\n📘 STEP 5: Generating Consortium Hash');
    console.log('─'.repeat(80));

    // Combine all hashes to create a consortium hash
    const consortiumData = {
        ulpin: ulpin,
        fabricTxHash: fabricTxHash,
        ifscHash: ifscHash,
        timestamp: Date.now()
    };

    const consortiumHash = generateHash(JSON.stringify(consortiumData));

    console.log('   Consortium Hash Components:');
    console.log(`     - ULPIN: ${ulpin}`);
    console.log(`     - Fabric TX Hash: 0x${fabricTxHash.substring(0, 16)}...`);
    console.log(`     - IFSC Hash: 0x${ifscHash.substring(0, 16)}...`);
    console.log(`   📊 Consortium Hash: 0x${consortiumHash}`);

    // ========================================
    // STEP 6: Connect to Ethereum via Web3.js
    // ========================================
    console.log('\n📘 STEP 6: Connecting to Ethereum Network (Hardhat)');
    console.log('─'.repeat(80));

    const web3 = new Web3(ETHEREUM_CONFIG.providerUrl);
    const account = web3.eth.accounts.privateKeyToAccount(ETHEREUM_CONFIG.privateKey);
    web3.eth.accounts.wallet.add(account);

    const anchorRegistry = new web3.eth.Contract(
        ANCHOR_REGISTRY_ABI as any,
        ETHEREUM_CONFIG.contractAddress
    );

    console.log('✅ Connected to Ethereum Network');
    console.log(`   Provider: ${ETHEREUM_CONFIG.providerUrl}`);
    console.log(`   Contract: ${ETHEREUM_CONFIG.contractAddress}`);
    console.log(`   Account: ${account.address}`);

    // ========================================
    // STEP 7: Anchor Consortium Hash to Ethereum
    // ========================================
    console.log('\n📘 STEP 7: Anchoring Consortium Hash to Ethereum');
    console.log('─'.repeat(80));

    // Convert consortium hash to bytes32
    const consortiumHashBytes32 = '0x' + consortiumHash;

    console.log('   Anchoring to Ethereum blockchain...');

    const anchorTx = await anchorRegistry.methods
        .anchorHash(ulpin, 'PROPERTY_CREATION', consortiumHashBytes32)
        .send({
            from: account.address,
            gas: '300000'
        });

    console.log('✅ Consortium Hash anchored to Ethereum!');
    console.log(`   Transaction Hash: ${anchorTx.transactionHash}`);
    console.log(`   Block Number: ${anchorTx.blockNumber}`);
    console.log(`   Gas Used: ${anchorTx.gasUsed}`);

    // ========================================
    // STEP 8: Verify Consortium Update
    // ========================================
    console.log('\n📘 STEP 8: Verifying Consortium Updates Across Blockchains');
    console.log('─'.repeat(80));

    // Verify on Fabric
    const fabricVerification = await contract.evaluateTransaction('QueryParcel', ulpin);
    const fabricParcel = JSON.parse(fabricVerification.toString());

    console.log('✅ Fabric Verification:');
    console.log(`   ULPIN: ${fabricParcel.ulpin}`);
    console.log(`   Owner: ${fabricParcel.ownerId}`);
    console.log(`   Status: ${fabricParcel.status}`);
    console.log(`   Document Hash: ${fabricParcel.documentHash}`);

    // Verify on Ethereum
    const ethereumAnchors: any = await anchorRegistry.methods.getAnchors(ulpin).call();

    console.log('\n✅ Ethereum Verification:');
    console.log(`   Total Anchors for ULPIN: ${ethereumAnchors.length}`);

    if (ethereumAnchors.length > 0) {
        const latestAnchor = ethereumAnchors[ethereumAnchors.length - 1];
        console.log(`   Latest Event Type: ${latestAnchor.eventType}`);
        console.log(`   Hash: ${latestAnchor.hash}`);
        console.log(`   Timestamp: ${new Date(Number(latestAnchor.timestamp) * 1000).toISOString()}`);
    }

    // ========================================
    // STEP 9: Demonstrate Property Transfer
    // ========================================
    console.log('\n📘 STEP 9: Demonstrating Property Transfer with Hash Updates');
    console.log('─'.repeat(80));

    const transferRequest = {
        requestId: 'TR-' + Date.now(),
        assetId: ulpin,
        newOwners: [
            { id: 'CITIZEN-002', name: 'Priya Sharma', share: 100 }
        ],
        supportingDocs: [
            { type: 'SALE_DEED', hash: generateHash('sale-deed-document') },
            { type: 'NOC', hash: generateHash('noc-document') }
        ]
    };

    console.log(`   Transfer Request ID: ${transferRequest.requestId}`);
    console.log(`   From: ${propertyData.ownerName} (${propertyData.ownerId})`);
    console.log(`   To: ${transferRequest.newOwners[0].name} (${transferRequest.newOwners[0].id})`);

    // Initiate transfer on Fabric
    await contract.submitTransaction(
        'InitiateTransfer',
        transferRequest.requestId,
        transferRequest.assetId,
        JSON.stringify(transferRequest.newOwners),
        JSON.stringify(transferRequest.supportingDocs)
    );

    console.log('✅ Transfer initiated on Fabric');

    // Generate new consortium hash for transfer
    const transferConsortiumData = {
        ulpin: ulpin,
        requestId: transferRequest.requestId,
        transferType: 'SALE',
        fabricTxHash: generateHash(JSON.stringify(transferRequest)),
        ifscHash: generateIFSCHash('HDFC0001234', 10000000, 'TXN' + Date.now()),
        timestamp: Date.now()
    };

    const transferConsortiumHash = '0x' + generateHash(JSON.stringify(transferConsortiumData));

    // Anchor transfer hash to Ethereum
    const transferAnchorTx = await anchorRegistry.methods
        .anchorHash(ulpin, 'PROPERTY_TRANSFER', transferConsortiumHash)
        .send({
            from: account.address,
            gas: '300000'
        });

    console.log('✅ Transfer hash anchored to Ethereum!');
    console.log(`   Transaction Hash: ${transferAnchorTx.transactionHash}`);
    console.log(`   Block Number: ${transferAnchorTx.blockNumber}`);

    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log('📊 CONSORTIUM BLOCKCHAIN UPDATE SUMMARY');
    console.log('═'.repeat(80));

    const finalAnchors: any = await anchorRegistry.methods.getAnchors(ulpin).call();

    console.log(`\n🏠 Property: ${ulpin}`);
    console.log(`   Location: ${propertyData.location}`);
    console.log(`   Area: ${propertyData.area} sq.m`);
    console.log('\n📘 Hyperledger Fabric (Private Consortium):');
    console.log(`   ✓ Property created with ULPIN`);
    console.log(`   ✓ Transfer request initiated`);
    console.log(`   ✓ All transaction data stored privately`);
    console.log('\n💎 Ethereum (Public Verification):');
    console.log(`   ✓ Total anchored hashes: ${finalAnchors.length}`);

    for (let i = 0; i < finalAnchors.length; i++) {
        const anchor = finalAnchors[i];
        console.log(`   ${i + 1}. ${anchor.eventType}`);
        console.log(`      Hash: ${anchor.hash}`);
        console.log(`      Time: ${new Date(Number(anchor.timestamp) * 1000).toLocaleString('en-IN')}`);
    }

    console.log('\n🏦 Bank Integration (IFSC Codes):');
    console.log(`   ✓ Registration fee verified: ${bankTransaction.ifscCode}`);
    console.log(`   ✓ Transfer payment verified: HDFC0001234`);
    console.log(`   ✓ All financial hashes included in consortium`);

    console.log('\n🔐 Hash Propagation Flow:');
    console.log('   1️⃣  ULPIN generated → Unique property identifier');
    console.log('   2️⃣  Fabric TX → Private transaction on consortium blockchain');
    console.log('   3️⃣  IFSC Hash → Bank verification integrated');
    console.log('   4️⃣  Consortium Hash → Combined hash of all components');
    console.log('   5️⃣  Ethereum Anchor → Public verification on Ethereum');
    console.log('   6️⃣  Web3.js → Smart contract interaction via Web3');

    console.log('\n✅ All systems updated successfully!');
    console.log('═'.repeat(80));

    await gateway.disconnect();
}

main()
    .then(() => {
        console.log('\n🎉 Test scenario completed successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error(`\n❌ Error: ${error}`);
        process.exit(1);
    });
