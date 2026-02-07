import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface KycInitiateResponse {
    id: string;
    access_token: {
        id: string;
    };
    status: string;
}

export class KycService {
    private baseUrl = 'https://api.digio.in/v2/client/kyc/workflow/initiate';
    private clientId = process.env.DIGIO_CLIENT_ID;
    private clientSecret = process.env.DIGIO_CLIENT_SECRET;

    async initiateKyc(aadhaarNumber: string, customerIdentifier: string, redirectUrl: string): Promise<KycInitiateResponse> {
        // In production, we'd use real Digio API keys and endpoints
        // For development/mock purposes, we'll simulate the interaction
        console.log(`Initiating KYC for ${customerIdentifier} via Digio...`);

        try {
            // Mocking the Digio API call
            // const response = await axios.post(this.baseUrl, {
            //     customer_identifier: customerIdentifier,
            //     customer_name: "Mock User", // In a real app, this would be passed or fetched
            //     template_name: "AADHAAR_KYC_TEMPLATE",
            //     notify_customer: true,
            //     transaction_id: `TXN_${Date.now()}`,
            //     redirect_url: redirectUrl
            // }, {
            //     auth: {
            //         username: this.clientId!,
            //         password: this.clientSecret!
            //     }
            // });
            // return response.data;

            // Simulated response for demonstration
            return {
                id: `KREQ_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                access_token: {
                    id: `ATK_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                },
                status: 'requested'
            };
        } catch (error) {
            console.error('Error initiating KYC with Digio:', error);
            throw new Error('Failed to initiate identity verification');
        }
    }

    async getKycStatus(requestId: string) {
        // Simulate status check
        return {
            id: requestId,
            status: 'completed', // For the prototype, we assume success after initiation
            kyc_data: {
                aadhaar_last_four: '1234',
                full_name: 'Jane Doe',
                is_verified: true
            }
        };
    }
}

export const kycService = new KycService();
