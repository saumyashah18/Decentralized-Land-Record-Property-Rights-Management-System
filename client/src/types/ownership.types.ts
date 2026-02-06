export interface Ownership {
    id: string;
    currentOwner: string;
    previousOwner?: string;
    transferDate: string;
    transactionHash: string;
}
