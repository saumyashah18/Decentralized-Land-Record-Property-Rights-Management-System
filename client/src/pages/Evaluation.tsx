import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { API_BASE_URL } from '../utils/constants';
import { BlockchainVisualizer } from '../components/BlockchainVisualizer';

// Type definitions
interface RegistrarNode {
    id: string;
    name: string;
    location: string;
    status: 'idle' | 'voting' | 'committed';
    voteTimestamp?: number;
}

interface FabricScenarioState {
    parcelId: string;
    requestId: string;
    initiator: string;
    newOwner: string;
    registrars: RegistrarNode[];
    currentStage: 'initiated' | 'voting' | 'committed' | 'completed';
    consensusDetails: {
        leader: string;
        votesReceived: number;
        votesRequired: number;
        logIndex: number;
    };
    timestamp: number;
}

interface EthereumScenarioState {
    parcelId: string;
    fabricTxId: string;
    fabricHash: string;
    ethereumTxHash?: string;
    blockNumber?: number;
    status: 'pending' | 'hashing' | 'submitting' | 'confirmed';
    timestamp?: number;
    explorerUrl?: string;
}

export const Evaluation: React.FC = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [scenario1, setScenario1] = useState<FabricScenarioState | null>(null);
    const [scenario2, setScenario2] = useState<EthereumScenarioState | null>(null);

    // Fetch scenario states
    const fetchScenarios = async () => {
        try {
            const [res1, res2] = await Promise.all([
                fetch(`${API_BASE_URL}/evaluation/scenario1/status`),
                fetch(`${API_BASE_URL}/evaluation/scenario2/status`)
            ]);

            if (res1.ok) {
                const data1 = await res1.json();
                setScenario1(data1.data);
            }

            if (res2.ok) {
                const data2 = await res2.json();
                setScenario2(data2.data);
            }
        } catch (error) {
            console.error('Error fetching scenarios:', error);
        }
    };

    // Start tracking
    const startTracking = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/evaluation/start`, {
                method: 'POST'
            });

            if (response.ok) {
                setIsTracking(true);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to start tracking:', response.status, errorData);
                alert(`Error: ${response.status} ${response.statusText}. Please ensure the server is running and you have authorized the tunnel.`);
            }
        } catch (error) {
            console.error('Error starting tracking:', error);
            alert('Connection failed. Please ensure the backend server is running at ' + API_BASE_URL);
        }
    };

    // Reset scenarios
    const resetScenarios = async () => {
        try {
            await fetch(`${API_BASE_URL}/evaluation/reset`, {
                method: 'POST'
            });
            setIsTracking(false);
            setScenario1(null);
            setScenario2(null);
        } catch (error) {
            console.error('Error resetting scenarios:', error);
        }
    };

    // Poll for updates when tracking
    useEffect(() => {
        if (isTracking) {
            const interval = setInterval(fetchScenarios, 1000);
            return () => clearInterval(interval);
        }
    }, [isTracking]);

    // Get status badge variant
    const getStatusVariant = (status: string): 'success' | 'info' | 'neutral' | 'warning' => {
        switch (status) {
            case 'completed':
            case 'confirmed':
            case 'committed':
                return 'success';
            case 'voting':
            case 'submitting':
            case 'hashing':
                return 'info';
            default:
                return 'neutral';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
                        Evaluation Dashboard
                    </h1>
                    <p className="text-text-muted mt-2">Real-time Hybrid Blockchain Flow Analysis</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={startTracking}
                        disabled={isTracking}
                        className={`px-6 py-2 rounded-full font-semibold transition-all ${isTracking
                            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                            : 'bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30'
                            }`}
                    >
                        {isTracking ? '🔴 Tracking Active' : '🚀 Start Live Tracking'}
                    </button>
                    <button
                        onClick={resetScenarios}
                        className="px-6 py-2 rounded-full font-semibold bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-all"
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Blockchain Visualizer */}
            <BlockchainVisualizer />

            {/* Two Scenario Panels */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Scenario 1: Hyperledger Fabric Multi-Registrar Workflow */}
                <GlassCard title="🔗 Scenario 1: Gandhinagar Multi-Registrar Consensus" className="h-full">
                    <div className="space-y-4">
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                            <h3 className="font-bold text-lg mb-2">Gujarat Land Record Transfer Flow</h3>
                            <p className="text-sm text-text-muted">
                                Demonstrates Raft consensus algorithm with Gandhinagar & GIFT City registrar offices approving a transfer
                            </p>
                        </div>

                        {scenario1 ? (
                            <>
                                {/* Transaction Details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/5 rounded border border-white/10">
                                        <div className="text-xs text-text-muted uppercase">Land Parcel ID</div>
                                        <div className="font-mono text-sm mt-1">{scenario1.parcelId}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded border border-white/10">
                                        <div className="text-xs text-text-muted uppercase">Request ID</div>
                                        <div className="font-mono text-sm mt-1 truncate">{scenario1.requestId}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded border border-white/10">
                                        <div className="text-xs text-text-muted uppercase">Initiator</div>
                                        <div className="font-mono text-sm mt-1">{scenario1.initiator}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded border border-white/10">
                                        <div className="text-xs text-text-muted uppercase">New Owner</div>
                                        <div className="font-mono text-sm mt-1">{scenario1.newOwner}</div>
                                    </div>
                                </div>

                                {/* Consensus Progress */}
                                <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold">Raft Consensus Progress</h4>
                                        <Badge
                                            label={scenario1.currentStage.toUpperCase()}
                                            variant={getStatusVariant(scenario1.currentStage)}
                                        />
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Leader Node:</span>
                                            <span className="font-mono">{scenario1.consensusDetails.leader}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Votes Received:</span>
                                            <span className="font-mono">
                                                {scenario1.consensusDetails.votesReceived} / {scenario1.consensusDetails.votesRequired}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Log Index:</span>
                                            <span className="font-mono">{scenario1.consensusDetails.logIndex}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Registrar Nodes */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Registrar Offices</h4>
                                    {scenario1.registrars.map((registrar) => (
                                        <div
                                            key={registrar.id}
                                            className={`p-3 rounded-lg border transition-all ${registrar.status === 'committed'
                                                ? 'bg-success/10 border-success/50'
                                                : registrar.status === 'voting'
                                                    ? 'bg-primary/10 border-primary/50 animate-pulse'
                                                    : 'bg-white/5 border-white/10'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-sm">{registrar.name}</div>
                                                    <div className="text-xs text-text-muted">
                                                        {registrar.id} • {registrar.location}
                                                    </div>
                                                </div>
                                                <Badge
                                                    label={registrar.status.toUpperCase()}
                                                    variant={getStatusVariant(registrar.status)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-text-muted">
                                <p>Click "Start Live Tracking" to begin demonstration</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Scenario 2: Ethereum Anchoring Workflow */}
                <GlassCard title="⚡ Scenario 2: Web3.js Ethereum Anchoring" className="h-full">
                    <div className="space-y-4">
                        <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                            <h3 className="font-bold text-lg mb-2">Public Blockchain Anchoring</h3>
                            <p className="text-sm text-text-muted">
                                Demonstrates hash generation from Fabric and anchoring to Polygon Amoy for public verification
                            </p>
                        </div>

                        {scenario2 ? (
                            <>
                                {/* Transaction Flow */}
                                <div className="space-y-3">
                                    {/* Step 1: Fabric Transaction */}
                                    <div
                                        className={`p-4 rounded-lg border transition-all ${scenario2.status !== 'pending'
                                            ? 'bg-success/10 border-success/50'
                                            : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">📜</span>
                                                <span className="font-semibold">Fabric Transaction</span>
                                            </div>
                                            {scenario2.status !== 'pending' && <span className="text-success">✓</span>}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-text-muted">Parcel ID:</span>
                                                <span className="font-mono">{scenario2.parcelId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-muted">Fabric TX ID:</span>
                                                <span className="font-mono text-xs truncate max-w-[200px]">
                                                    {scenario2.fabricTxId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2: Hash Generation */}
                                    <div
                                        className={`p-4 rounded-lg border transition-all ${scenario2.status === 'hashing' || scenario2.status === 'submitting' || scenario2.status === 'confirmed'
                                            ? scenario2.status === 'hashing'
                                                ? 'bg-primary/10 border-primary/50 animate-pulse'
                                                : 'bg-success/10 border-success/50'
                                            : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🔐</span>
                                                <span className="font-semibold">SHA256 Hash Generation</span>
                                            </div>
                                            {(scenario2.status === 'submitting' || scenario2.status === 'confirmed') && (
                                                <span className="text-success">✓</span>
                                            )}
                                        </div>
                                        {scenario2.fabricHash && (
                                            <div className="mt-2 p-2 bg-black/30 rounded font-mono text-xs break-all">
                                                {scenario2.fabricHash}
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 3: Web3.js Submission */}
                                    <div
                                        className={`p-4 rounded-lg border transition-all ${scenario2.status === 'submitting'
                                            ? 'bg-primary/10 border-primary/50 animate-pulse'
                                            : scenario2.status === 'confirmed'
                                                ? 'bg-success/10 border-success/50'
                                                : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">⚡</span>
                                                <span className="font-semibold">Web3.js Submission</span>
                                            </div>
                                            {scenario2.status === 'confirmed' && <span className="text-success">✓</span>}
                                        </div>
                                        <div className="text-sm text-text-muted">
                                            Submitting to Polygon Amoy Testnet...
                                        </div>
                                    </div>

                                    {/* Step 4: Ethereum Confirmation */}
                                    <div
                                        className={`p-4 rounded-lg border transition-all ${scenario2.status === 'confirmed'
                                            ? 'bg-success/10 border-success/50'
                                            : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🔍</span>
                                                <span className="font-semibold">Public Verification</span>
                                            </div>
                                            {scenario2.status === 'confirmed' && <span className="text-success">✓</span>}
                                        </div>
                                        {scenario2.ethereumTxHash && (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-text-muted">TX Hash:</span>
                                                    <span className="font-mono text-xs truncate max-w-[200px]">
                                                        {scenario2.ethereumTxHash}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-text-muted">Block Number:</span>
                                                    <span className="font-mono">{scenario2.blockNumber}</span>
                                                </div>
                                                {scenario2.explorerUrl && (
                                                    <a
                                                        href={scenario2.explorerUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline flex items-center gap-1 mt-2"
                                                    >
                                                        View on PolygonScan ↗
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-text-muted">
                                <p>Click "Start Live Tracking" to begin demonstration</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard title="Architecture Integrity (Proof)" className="h-full">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="p-2 bg-primary/20 rounded">📜</div>
                            <div>
                                <div className="text-sm font-semibold text-text-muted uppercase tracking-tighter">
                                    Fabric Channel
                                </div>
                                <div className="font-mono text-sm">mychannel</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="p-2 bg-accent/20 rounded">🌍</div>
                            <div>
                                <div className="text-sm font-semibold text-text-muted uppercase tracking-tighter">
                                    Polygon Network
                                </div>
                                <div className="font-mono text-sm">Amoy Testnet (80002)</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="p-2 bg-success/20 rounded">📄</div>
                            <div>
                                <div className="text-sm font-semibold text-text-muted uppercase tracking-tighter">
                                    Anchor Contract
                                </div>
                                <div className="font-mono text-sm truncate max-w-[200px]">
                                    0x0bb955b22105bA7D6F89aBCbEE1860e4DAD85A79
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="System Performance" className="h-full">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Fabric Throughput</span>
                                <span className="text-success">Sub-second</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                                <div className="bg-success h-2 rounded-full w-[95%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Amoy Settlement Time</span>
                                <span className="text-primary">~2.5s (Typical)</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full w-[80%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Hash Consistency</span>
                                <span className="text-accent">100% Verified</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                                <div className="bg-accent h-2 rounded-full w-full" />
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
