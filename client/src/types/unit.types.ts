export interface Unit {
    id: string;
    unitNumber: string;
    parcelId: string;
    type: 'residential' | 'commercial';
    area: number;
}
