export interface AuditLog {
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
}
