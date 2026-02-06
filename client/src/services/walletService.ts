// Mock wallet service - No external dependencies
const MOCK_DELAY = 800;

export const walletService = {
    connect: async () => {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        return {
            getAddress: async () => "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        };
    },
    getAddress: async () => {
        return "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    }
};
