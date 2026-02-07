// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RegistrarRoleToken
 * @dev Soulbound (non-transferable) ERC-721 token representing registrar authority.
 * Only the contract owner (backend service) can mint/revoke tokens.
 */
contract RegistrarRoleToken is ERC721, Ownable {
    
    struct RegistrarInfo {
        string officialId;      // Government ID from e-Pramaan
        string designation;     // e.g., "Sub-Registrar"
        string jurisdiction;    // e.g., "District X"
        uint256 issuedAt;
        bool active;
    }
    
    // Mapping from token ID to registrar info
    mapping(uint256 => RegistrarInfo) public registrarInfo;
    
    // Mapping from wallet address to token ID (one token per address)
    mapping(address => uint256) public registrarToken;
    
    // Counter for token IDs
    uint256 private _tokenIdCounter;
    
    // Events
    event RegistrarMinted(address indexed registrar, uint256 tokenId, string jurisdiction);
    event RegistrarRevoked(address indexed registrar, uint256 tokenId);
    
    constructor() ERC721("BhoomiSetu Registrar Role", "BSRR") Ownable(msg.sender) {
        _tokenIdCounter = 1;
    }
    
    /**
     * @dev Mint a new registrar role token
     * @param to Address of the registrar
     * @param officialId Government official ID from OIDC
     * @param designation Role designation (e.g., "Sub-Registrar")
     * @param jurisdiction Area of authority (e.g., "Mumbai District")
     */
    function mint(
        address to,
        string memory officialId,
        string memory designation,
        string memory jurisdiction
    ) external onlyOwner returns (uint256) {
        require(registrarToken[to] == 0, "Registrar already has a role token");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        registrarInfo[tokenId] = RegistrarInfo({
            officialId: officialId,
            designation: designation,
            jurisdiction: jurisdiction,
            issuedAt: block.timestamp,
            active: true
        });
        
        registrarToken[to] = tokenId;
        
        emit RegistrarMinted(to, tokenId, jurisdiction);
        
        return tokenId;
    }
    
    /**
     * @dev Revoke a registrar's role token
     * @param registrar Address of the registrar to revoke
     */
    function revoke(address registrar) external onlyOwner {
        uint256 tokenId = registrarToken[registrar];
        require(tokenId != 0, "Registrar has no role token");
        
        registrarInfo[tokenId].active = false;
        registrarToken[registrar] = 0;
        
        _burn(tokenId);
        
        emit RegistrarRevoked(registrar, tokenId);
    }
    
    /**
     * @dev Check if an address has an active registrar role
     * @param account Address to check
     */
    function hasRole(address account) external view returns (bool) {
        uint256 tokenId = registrarToken[account];
        if (tokenId == 0) return false;
        return registrarInfo[tokenId].active;
    }
    
    /**
     * @dev Get registrar info for an address
     * @param account Address to query
     */
    function getRegistrarInfo(address account) external view returns (RegistrarInfo memory) {
        uint256 tokenId = registrarToken[account];
        require(tokenId != 0, "Not a registrar");
        return registrarInfo[tokenId];
    }
    
    /**
     * @dev Override transfer functions to make token soulbound (non-transferable)
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // Block all other transfers
        if (from != address(0) && to != address(0)) {
            revert("RegistrarRoleToken: tokens cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }
}
