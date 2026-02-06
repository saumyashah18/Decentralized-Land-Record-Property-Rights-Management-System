export interface Parcel {
    id: string;
    parcelId: string;
    ownerId: string;
    address: string;
    area: number;
    coordinates: [number, number];
    status: 'active' | 'pending' | 'transferred';
    registrationDate: string;
}
