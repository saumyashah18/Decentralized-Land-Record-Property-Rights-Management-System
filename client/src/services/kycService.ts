import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface KycResponse {
    id: string;
    access_token: {
        id: string;
    };
    status: string;
}

export const kycService = {
    initiate: async (aadhaarNumber: string, customerIdentifier: string): Promise<KycResponse> => {
        // Calls backend to initiate KYC flow
        const response = await axios.post(`${API_BASE_URL}/kyc/initiate`, {
            aadhaarNumber,
            customerIdentifier,
            redirectUrl: window.location.origin + '/kyc/callback'
        });
        return response.data;
    },

    getStatus: async (requestId: string) => {
        const response = await axios.get(`${API_BASE_URL}/kyc/status/${requestId}`);
        return response.data;
    }
};

// Keeping this for backward compatibility if needed, but transitioning to kycService
export const aadhaarService = {
    sendOtp: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
    },
    verifyOtp: async (otp: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return otp === '123456';
    }
};
