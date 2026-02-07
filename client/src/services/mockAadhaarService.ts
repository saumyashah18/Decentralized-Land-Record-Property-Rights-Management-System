export const aadhaarService = {
    verify: async (aadhaarNo: string): Promise<{ success: boolean; data?: any }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (aadhaarNo.length === 12) {
                    resolve({
                        success: true,
                        data: {
                            name: "Suryaraj Sinh Jadeja", // Mock name matches user context mostly
                            dob: "01-01-1990",
                            address: "123, Tech Park, Gujarat",
                            photo: "https://ui-avatars.com/api/?name=Suryaraj+Jadeja&background=random"
                        }
                    });
                } else {
                    resolve({ success: false });
                }
            }, 2000);
        });
    },

    sendOtp: async (): Promise<boolean> => {
        return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
    },

    verifyOtp: async (otp: string): Promise<boolean> => {
        return new Promise((resolve) => setTimeout(() => resolve(otp === "123456"), 1500));
    }
};
