# BhoomiSetu: Technical Documentation & System Specification

## 1. Problem Definition & Objective

**Problem**: Land ownership records in India are fragmented across multiple departments and often rely on paper-based or siloed digital systems. This lack of transparency leads to:
- Disputed titles and fraudulent sales.
- Forged documents and lengthy litigation.
- Lack of trust in property transactions, especially in rural areas.

**Objective**: To build BhoomiSetu—a secure, transparent, and immutable hybrid blockchain platform that creates a single source of truth for:
- Digitally recording land titles and ownership history.
- Preventing duplicate or fraudulent transactions.
- Enabling verifiable and auditable property transfers.
- Integrating multiple stakeholders (Registrars, Citizens, Banks, Courts) without central manipulation.

---

## 2. System Architecture

BhoomiSetu employs a **Hybrid Blockchain Architecture** to balance authoritative governance with public transparency.

### 2.1 Hybrid Ledger Layer
- **Hyperledger Fabric (Authority Chain)**:
    - Acts as the private, permissioned ledger for detailed land records, survey metadata, and personal identification.
    - Managed by a consortium of government departments (Revenue, Registrar, Land Records).
    - **Consensus**: Raft (Crash Fault Tolerant).
- **Ethereum (Integrity Chain)**:
    - Acts as a public "Proof of Integrity" layer.
    - Only cryptographic SHA-256 hashes of Fabric state transitions are anchored to Ethereum.
    - Citizens can independently verify that the authority's state matches the public anchor.

### 2.2 Storage Layer
- **IPFS (InterPlanetary File System)**:
    - Decentralized storage for heavy binary assets: Sale Deeds, Survey Maps, Court Orders, and KYC documents.
    - Only the IPFS Content Identifier (CID) is stored on-chain.

### 2.3 Application Layer
- **Orchestration Server**: Node.js (TypeScript) handling gateway connectivity to Fabric and Ethereum.
- **AI Domain Assistant (Bhoomika)**: A Python-based RAG (Retrieval-Augmented Generation) server using **Google Gemini 2.0 Flash** and local embeddings (BGE-Large) to provide natural language assistance for legal domain queries.
- **Frontend**: A modern React/Vite dashboard featuring interactive GIS-based land verification. It utilizes a **QGIS-derived map layer proxy** to visually represent land parcels as robust, real-world blocks, ensuring high fidelity in spatial representation.

---

## 3. Data Models (Technical Specification)

The system records land parcels as unique digital assets on the blockchain.

### 3.1 Land Parcel (`Parcel`)
- **ULPIN**: Unique Land Parcel Identification Number (Primary Key).
- **Area**: Geographic area in square meters/acres.
- **Location**: Metadata including village/district coordinates.
- **Status**: `ACTIVE`, `FROZEN` (disputed), `PARTITIONED`, or `MERGED`.
- **Owners**: A collection of `OwnershipRecord` objects identifying current owners, their share percentage, and ownership type (e.g., Full, Joint, Ancestral).
- **Encumbrances**: List of active liens, mortgages, or leases.
- **Disputes**: List of active legal challenges.

### 3.2 Sub-Divisions (`Unit`)
- Maps to unit-level apartments or floors within a parent parcel. Includes **Undivided Share (UDS)** calculation.

---

## 4. Key Functional Implementations

### 4.1 Digitization & GIS Visualization
- **ULPIN & Block ID Integration**: Every parcel is minted as a blockchain asset with a unique ULPIN. The frontend explicitly displays these ULPINs/Block IDs for owners, providing a direct link between the physical land and its digital twin.
- **Robust Mapping Foundation**: To ensure the "realness" and robustness of the system, we have created a **proxy mapping layer** in the frontend. This layer is based on actual land blocks marked via **QGIS**, allowing citizens and authorities to see the exact boundaries and physical layout of properties on the map.
- **KYC Integration**: Built-in service for **Digio/Aadhaar** based identity verification to ensure only authenticated users participate.

### 4.2 Ownership & Title Management
- **Immutable History**: Fabric's "World State" and "Blockchain" provide a timestamped audit trail of every ownership change.
- **Complex Scenarios**: Support for Inheritance and Partition (Sub-division) through specialized smart contract functions.

### 4.3 Property Transfer Lifecycle
1. **Initiate**: Buyer/Seller creates a `TransferRequest` with supporting CIDs.
2. **Validation**: Smart contract automatically checks if the parcel is `FROZEN` due to disputes or encumbrances.
3. **Approval**: Registrar signs the transaction (Enforced by MSP checks).
4. **Finalize**: Ownership is updated immutably on Fabric, and a proof hash is anchored to Ethereum via `AnchorService`.

### 4.4 Encumbrance & Dispute Tracking
- **Freezing Mechanism**: Any active dispute or mortgage automatically flags the asset, preventing any further transfer until resolved.
- **Audit Access**: Legal authorities can query the dispute history on-chain.

---

## 5. Security & Technical Constraints

### 5.1 Privacy & Compliance
- **Off-chain Sensitivity**: Detailed citizen data is kept off-chain or in the private Fabric layer. Only non-identifiable cryptographic proofs reach the public Ethereum blockchain.
- **Role-Based Access (RBAC)**: Enforced via Fabric MSPs. Only authorized Registrars can approve transactions.

### 5.2 Scalability
- **Low Gas Costs**: By only anchoring hashes to Ethereum, the system avoids the high costs of public blockchain storage while maintaining global trust.

---

## 6. Project Structure Overview

```text
├── bhoomika/            # AI Domain Assistant (Python RAG)
├── chaincode/           # Hyperledger Fabric Smart Contracts (TypeScript)
├── client/              # React/Vite Frontend Application
├── ethereum-contracts/  # Solidity Anchoring Contracts (Hardhat)
├── server/              # Node.js Orchestration API
```

---
**Document Version**: 1.0.0
**Status**: Implementation Complete
