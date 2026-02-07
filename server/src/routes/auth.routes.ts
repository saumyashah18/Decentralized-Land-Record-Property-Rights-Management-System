import { Router, Request, Response } from 'express';
import { oidcService, RegistrarClaims } from '../services/oidc.service';

const router = Router();

// In-memory session store for demo (use Redis in production)
const registrarSessions: Map<string, { claims: RegistrarClaims; walletAddress?: string }> = new Map();

/**
 * GET /api/auth/registrar/login
 * Initiates OIDC login flow - redirects to Auth0 (e-Pramaan placeholder)
 */
router.get('/registrar/login', async (req: Request, res: Response) => {
    try {
        await oidcService.initialize();
        const { url, state } = oidcService.getAuthorizationUrl();

        // Store state in cookie for verification on callback
        res.cookie('oidc_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        res.redirect(url);
    } catch (error: any) {
        console.error('OIDC login error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/registrar/login?error=oidc_init_failed`);
    }
});

/**
 * GET /api/auth/registrar/callback
 * Handles OIDC callback from Auth0
 */
router.get('/registrar/callback', async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;
        const savedState = req.cookies?.oidc_state;

        if (!code || !state) {
            throw new Error('Missing code or state');
        }

        if (state !== savedState) {
            throw new Error('State mismatch - possible CSRF attack');
        }

        await oidcService.initialize();
        const { claims } = await oidcService.handleCallback(
            code as string,
            state as string
        );

        // Generate a session token
        const sessionToken = Buffer.from(JSON.stringify({
            sub: claims.sub,
            iat: Date.now()
        })).toString('base64');

        // Store session
        registrarSessions.set(sessionToken, { claims });

        // Clear OIDC state cookie
        res.clearCookie('oidc_state');

        // Redirect to frontend with session token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/registrar/callback?session=${sessionToken}`);

    } catch (error: any) {
        console.error('OIDC callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/registrar/login?error=${encodeURIComponent(error.message)}`);
    }
});

/**
 * GET /api/auth/registrar/session
 * Get current registrar session info
 */
router.get('/registrar/session', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No session token' });
    }

    const sessionToken = authHeader.substring(7);
    const session = registrarSessions.get(sessionToken);

    if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
    }

    res.json({
        authenticated: true,
        claims: session.claims,
        walletBound: !!session.walletAddress,
        walletAddress: session.walletAddress
    });
});

/**
 * POST /api/auth/registrar/bind-wallet
 * Bind a wallet address to the registrar session
 */
router.post('/registrar/bind-wallet', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No session token' });
    }

    const sessionToken = authHeader.substring(7);
    const session = registrarSessions.get(sessionToken);

    if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { walletAddress } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
    }

    // Update session with wallet address
    session.walletAddress = walletAddress;
    registrarSessions.set(sessionToken, session);

    // TODO: Mint RegistrarRoleToken on blockchain
    // This would require:
    // 1. Contract interaction service
    // 2. Private key management (use a custodial wallet or HSM)
    // For now, we just acknowledge the binding

    res.json({
        success: true,
        message: 'Wallet bound successfully',
        walletAddress,
        claims: session.claims,
        // In production: tokenId from minted RegistrarRoleToken
    });
});

/**
 * POST /api/auth/registrar/logout
 * Logout and invalidate session
 */
router.post('/registrar/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const sessionToken = authHeader.substring(7);
        registrarSessions.delete(sessionToken);
    }

    res.json({ success: true, message: 'Logged out' });
});

export default router;
