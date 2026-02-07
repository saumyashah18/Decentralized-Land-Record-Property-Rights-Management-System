# BhoomiSetu: A Decentralized Land Record & Property Rights Management System

BhoomiSetu is a secure, transparent, and immutable property registry platform designed to solve the problem of fragmented and fraudulent land records. It utilizes a hybrid blockchain architecture, combining the authoritative power of Hyperledger Fabric with the public auditability of Ethereum (Polygon).

## System Architecture

The platform consists of four primary layers:
1. **Frontend**: React-based dashboard with GIS mapping (QGIS proxy).
2. **Orchestration Server**: Node.js API connecting all components.
3. **Authority Ledger**: Hyperledger Fabric for private, government-controlled records.
4. **Integrity Layer**: Ethereum (Polygon) for public cryptographic anchoring.
5. **AI Assistant**: Bhoomika (RAG-based) for legal domain assistance.

## Deployment & Network Configuration

### 1. Hyperledger Fabric Network (Private/Gov Blockchain)
- **Deployment Type**: Local Docker Containers.
- **Startup Script**: `mac-fix-deploy.sh` (wraps `fabric-samples/test-network/network.sh`).
- **Running Components (Docker)**:
    - **Peers**: `peer0.org1.example.com`, `peer0.org2.example.com`
    - **Orderer**: `orderer.example.com`
    - **Chaincode**: `landregistry` (deployed via CCaaS container)
    - **CAs**: `ca_org1`, `ca_org2`, `ca_orderer`
- **Channel Name**: `mychannel`

### 2. Ethereum Network (Public/Verification Blockchain)
- **Deployment Type**: Remote Testnet.
- **Network**: Polygon Amoy Testnet (Chain ID: `80002`).
- **RPC Endpoint**: `https://rpc-amoy.polygon.technology` (Configured in `server/.env`).
- **Contract Config**: Located in `ethereum-contracts/hardhat.config.js`.

### 3. RAG AI Service (Bhoomika)
- **Deployment Type**: Local Python Process.
- **Address**: `http://0.0.0.0:8001`
- **Startup Command**: `npm run rag:dev` (runs `python bhoomika/simple_rag_server.py`).

### 4. Main API Server
- **Deployment Type**: Local Node.js Process.
- **Address**: `http://localhost:8000`
- **Startup Command**: `npm run server:dev`.

## Development

The system is designed as a hybrid architecture running locally for Fabric and AI, but connecting to a remote Polygon testnet for Ethereum operations, ensuring a balance between performance, privacy, and public trust.

---
**Technical Documentation**: Detailed spec can be found in [BhoomiSetu_Technical_Documentation.md](file:///c:/Users/hp/Downloads/BhoomiSetu-A-Blockchain-Based-Unified-Land-Registry-Platform-main/BhoomiSetu-A-Blockchain-Based-Unified-Land-Registry-Platform-main/docs/BhoomiSetu_Technical_Documentation.md).
