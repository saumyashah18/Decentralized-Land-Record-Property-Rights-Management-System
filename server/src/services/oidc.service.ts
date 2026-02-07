import * as client from 'openid-client';

/**
 * OIDC Service for Auth0 integration (placeholder for e-Pramaan)
 * In production, this would connect to the government e-Pramaan SSO
 * 
 * Updated for openid-client v6 API
 */

export interface RegistrarClaims {
    sub: string;            // Unique identifier
    name: string;           // Full name
    email?: string;         // Email (optional)
    department?: string;    // Government department
    designation: string;    // e.g., "Sub-Registrar"
    jurisdiction: string;   // e.g., "Mumbai District"
}

export interface OidcSession {
    codeVerifier: string;
    nonce: string;
    state: string;
}

class OidcService {
    private config: client.Configuration | null = null;

    // Session storage (in production, use Redis or similar)
    private sessions: Map<string, OidcSession> = new Map();

    private get domain(): string {
        return process.env.AUTH0_DOMAIN || 'your-tenant.auth0.com';
    }

    private get clientId(): string {
        return process.env.AUTH0_CLIENT_ID || '';
    }

    private get clientSecret(): string {
        return process.env.AUTH0_CLIENT_SECRET || '';
    }

    private get callbackUrl(): string {
        return process.env.AUTH0_CALLBACK_URL || 'http://localhost:8000/api/auth/registrar/callback';
    }

    /**
     * Initialize the OIDC client configuration
     */
    async initialize(): Promise<void> {
        if (this.config) return;

        try {
            const issuerUrl = new URL(`https://${this.domain}`);

            this.config = await client.discovery(
                issuerUrl,
                this.clientId,
                this.clientSecret
            );

            console.log('✅ OIDC Client initialized for Auth0');
        } catch (error) {
            console.error('❌ Failed to initialize OIDC client:', error);
            // Don't throw - allow app to start without OIDC
        }
    }

    /**
     * Generate authorization URL for registrar login
     */
    getAuthorizationUrl(): { url: string; state: string } {
        if (!this.config) {
            throw new Error('OIDC client not initialized');
        }

        const codeVerifier = client.randomPKCECodeVerifier();
        const codeChallenge = client.calculatePKCECodeChallenge(codeVerifier);
        const nonce = client.randomNonce();
        const state = client.randomState();

        // Store session data
        this.sessions.set(state, { codeVerifier, nonce, state });

        // Build authorization URL
        const parameters: Record<string, string> = {
            redirect_uri: this.callbackUrl,
            scope: 'openid profile email',
            code_challenge: codeChallenge as unknown as string,
            code_challenge_method: 'S256',
            nonce,
            state,
        };

        const redirectTo = client.buildAuthorizationUrl(this.config, parameters);

        return { url: redirectTo.href, state };
    }

    /**
     * Handle callback from OIDC provider
     */
    async handleCallback(code: string, state: string): Promise<{ claims: RegistrarClaims }> {
        if (!this.config) {
            throw new Error('OIDC client not initialized');
        }

        const session = this.sessions.get(state);
        if (!session) {
            throw new Error('Invalid or expired session state');
        }

        // Build the callback URL with the code
        const currentUrl = new URL(this.callbackUrl);
        currentUrl.searchParams.set('code', code);
        currentUrl.searchParams.set('state', state);

        // Exchange code for tokens
        const tokens = await client.authorizationCodeGrant(
            this.config,
            currentUrl,
            {
                pkceCodeVerifier: session.codeVerifier,
                expectedNonce: session.nonce,
                expectedState: session.state,
            }
        );

        // Clean up session
        this.sessions.delete(state);

        // Get claims from ID token or userinfo
        const claims = tokens.claims();

        // Map to our RegistrarClaims interface
        // In production with e-Pramaan, these would come from actual claims
        const registrarClaims: RegistrarClaims = {
            sub: claims?.sub || 'unknown',
            name: (claims?.name as string) || 'Unknown',
            email: claims?.email as string | undefined,
            department: (claims as any)?.department || 'Revenue Department',
            designation: (claims as any)?.designation || 'Sub-Registrar',
            jurisdiction: (claims as any)?.jurisdiction || 'Default District',
        };

        return { claims: registrarClaims };
    }

    /**
     * Verify an access token (for protected routes)
     */
    async verifyToken(accessToken: string): Promise<RegistrarClaims | null> {
        if (!this.config) return null;

        try {
            const userInfoResponse = await client.fetchUserInfo(
                this.config,
                accessToken,
                'sub' // Expected sub claim
            );

            return {
                sub: userInfoResponse.sub,
                name: (userInfoResponse.name as string) || 'Unknown',
                email: userInfoResponse.email as string | undefined,
                department: (userInfoResponse as any).department || 'Revenue Department',
                designation: (userInfoResponse as any).designation || 'Sub-Registrar',
                jurisdiction: (userInfoResponse as any).jurisdiction || 'Default District',
            };
        } catch {
            return null;
        }
    }
}

export const oidcService = new OidcService();
