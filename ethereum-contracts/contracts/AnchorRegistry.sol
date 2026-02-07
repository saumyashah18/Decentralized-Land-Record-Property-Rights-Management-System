// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AnchorRegistry
 * @dev Stores cryptographic hashes of land events for public verification.
 */
contract AnchorRegistry {
    struct Anchor {
        string eventType;
        bytes32 hash;
        uint256 timestamp;
        address sender;
    }

    // Mapping from a unique identifier (e.g., ULPIN or TX ID) to its anchors
    mapping(string => Anchor[]) private anchors;

    event HashAnchored(string indexed id, string eventType, bytes32 hash, uint256 timestamp);

    /**
     * @dev Anchors a hash to the public blockchain.
     * @param _id Unique identifier for the land record (ULPIN or transaction ID).
     * @param _eventType Type of event (e.g., "TRANSFER", "ENCUMBRANCE").
     * @param _hash The cryptographic hash of the private data/event.
     */
    function anchorHash(string memory _id, string memory _eventType, bytes32 _hash) public {
        Anchor memory newAnchor = Anchor({
            eventType: _eventType,
            hash: _hash,
            timestamp: block.timestamp,
            sender: msg.sender
        });

        anchors[_id].push(newAnchor);

        emit HashAnchored(_id, _eventType, _hash, block.timestamp);
    }

    /**
     * @dev Retrieves all anchors for a given ID.
     * @param _id Unique identifier to look up.
     */
    function getAnchors(string memory _id) public view returns (Anchor[] memory) {
        return anchors[_id];
    }
}
