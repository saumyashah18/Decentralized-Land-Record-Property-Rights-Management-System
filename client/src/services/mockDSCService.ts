export const dscService = {
    detectToken: async (): Promise<boolean> => {
        return new Promise((resolve) => setTimeout(() => resolve(true), 2000));
    },

    signTransaction: async (data: any): Promise<string> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
            }, 3000); // Simulate signing delay
        });
    }
};
