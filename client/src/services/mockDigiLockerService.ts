export const digiLockerService = {
    connect: async (): Promise<boolean> => {
        return new Promise((resolve) => setTimeout(() => resolve(true), 2000));
    },

    fetchDocuments: async (): Promise<any[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 'pan', name: 'PAN Verification Record', issuer: 'Income Tax Department', status: 'verified', date: '2023-01-15' },
                    { id: 'aadhaar', name: 'Aadhaar Card', issuer: 'UIDAI', status: 'verified', date: '2020-05-20' }
                ]);
            }, 1500);
        });
    }
};
