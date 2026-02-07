export interface OwnershipRecord {
    ownerId: string;
    ownershipType: 'FULL' | 'JOINT' | 'INHERITED';
    sharePercentage: number;
    kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface Parcel {
    docType?: string;
    ulpin: string;
    area: number;
    location: string;
    owners: OwnershipRecord[];
    status: 'ACTIVE' | 'FROZEN' | 'RESTRICTED' | 'GOVERNMENT' | 'PARTITIONED' | 'MERGED';
    encumbrances: string[]; // List of active EncumbranceIDs
    disputes: string[];     // List of active DisputeIDs
    parentUlpins?: string[]; // For amalgamation
    childUlpins?: string[];  // For partition
    lastUpdated: number;
    docHash: string;
}

export interface Unit {
    docType?: string;
    unitId: string; // ULPIN-BLOCK-FLOOR-UNIT
    parentUlpin: string;
    uds: number;
    owners: OwnershipRecord[];
    status: 'ACTIVE' | 'FROZEN';
    encumbrances: string[];
    disputes: string[];
    lastUpdated: number;
    docHash: string;
}

export interface TransferRequest {
    docType?: string;
    requestId: string;
    assetId: string; // ULPIN or UnitID
    requesterId: string;
    newOwners: OwnershipRecord[];
    type: 'TRANSFER' | 'INHERITANCE';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    supportingDocs: string[]; // IPFS hashes
    createdAt: number;
}

export interface Dispute {
    docType?: string;
    disputeId: string;
    assetId: string;
    reason: string;
    status: 'OPEN' | 'RESOLVED';
    createdAt: number;
    resolvedAt?: number;
    courtOrderHash?: string;
}

export interface Encumbrance {
    docType?: string;
    encumbranceId: string;
    assetId: string;
    type: 'MORTGAGE' | 'LEASE' | 'LIEN';
    status: 'ACTIVE' | 'RELEASED';
    docHash: string;
    createdAt: number;
}

