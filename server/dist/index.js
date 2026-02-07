"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const parcel_routes_1 = __importDefault(require("./routes/parcel.routes"));
const unit_routes_1 = __importDefault(require("./routes/unit.routes"));
const transfer_routes_1 = __importDefault(require("./routes/transfer.routes"));
const dispute_routes_1 = __importDefault(require("./routes/dispute.routes"));
const map_routes_1 = __importDefault(require("./routes/map.routes"));
const debug_routes_1 = __importDefault(require("./routes/debug.routes"));
const web3Client_1 = require("./ethereum/web3Client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Routes
app.use('/api/parcels', parcel_routes_1.default);
app.use('/api/units', unit_routes_1.default);
app.use('/api/transfers', transfer_routes_1.default);
app.use('/api/disputes', dispute_routes_1.default);
app.use('/api/map', map_routes_1.default);
app.use('/api/debug', debug_routes_1.default);
// Health Check
app.get('/health', async (req, res) => {
    const healthStatus = {
        status: 'UP',
        timestamp: new Date(),
        services: {
            backend: 'OK',
            ethereum: 'UNKNOWN',
            ipfs: 'OK' // IPFS service logs connection in constructor
        }
    };
    try {
        const web3 = (0, web3Client_1.getWeb3Client)();
        await web3.eth.net.isListening();
        healthStatus.services.ethereum = 'CONNECTED';
    }
    catch {
        healthStatus.services.ethereum = 'DISCONNECTED';
    }
    res.status(200).json(healthStatus);
});
app.listen(port, () => {
    console.log(`BhoomiSetu Backend listening at http://localhost:${port}`);
});
