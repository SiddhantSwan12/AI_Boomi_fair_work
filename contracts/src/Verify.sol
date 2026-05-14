// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Source: github.com/nextayush/merkleDoc (vverify/src/Verify.sol)
// Pragma fixed to 0.8.20 to match FairWorkEscrow project.

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712}  from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA}   from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Verify is Ownable, EIP712 {

    struct Info { address owner; uint256 timestamp; }

    mapping(bytes32 => Info) public docs;
    mapping(address => uint256) public nonces;

    event DocumentAccepted(bytes document, address owner);

    bytes32 private immutable _TYPE_HASH;

    constructor() EIP712("DocAnchor", "1") Ownable(msg.sender) {
        _TYPE_HASH = keccak256(
            "Anchor(bytes32 root,address owner,uint256 nonce,uint256 deadline)"
        );
    }

    // keccak256(abi.encodePacked(a, b)) — used for Merkle node combination
    function _hash(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b));
    }

    /// @notice Anchor a document Merkle root on-chain.
    ///         The backend calls this with the juror's EIP-712 signature.
    /// @param root     Merkle root of the credential documents
    /// @param docOwner Juror's wallet address
    /// @param deadline Signature expiry timestamp
    function anchorWithSig(
        bytes32 root,
        address docOwner,
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        require(block.timestamp <= deadline, "Signature expired");

        uint256 nonce = nonces[docOwner]++;

        bytes32 structHash = keccak256(abi.encode(
            _TYPE_HASH,
            root,
            docOwner,
            nonce,
            deadline
        ));

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, v, r, s);
        require(signer == docOwner, "Invalid signature");

        docs[root] = Info({ owner: docOwner, timestamp: block.timestamp });
        emit DocumentAccepted(abi.encode(root), docOwner);
    }

    /// @notice Verify that a document leaf is part of an anchored Merkle root.
    /// @param rootHash  The anchored Merkle root
    /// @param leaf      keccak256 hash of the document to prove
    /// @param proof     Sibling hashes from leaf to root
    /// @param isLeft    isLeft[i]=true means proof[i] is the left sibling
    function verify(
        bytes32 rootHash,
        bytes32 leaf,
        bytes32[] calldata proof,
        bool[] calldata isLeft
    ) external pure returns (bool ok) {
        require(proof.length == isLeft.length, "Length mismatch");

        bytes32 computed = leaf;
        unchecked {
            for (uint256 i = 0; i < proof.length; i++) {
                computed = isLeft[i]
                    ? _hash(proof[i], computed)
                    : _hash(computed, proof[i]);
            }
        }
        ok = (computed == rootHash);
    }
}

/// @dev Exposes internal EIP-712 helpers — used by tests and the frontend for signing
contract VerifyPublic is Verify {
    function exposedDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function exposedHashTypedDataV4(bytes32 structHash) external view returns (bytes32) {
        return _hashTypedDataV4(structHash);
    }
}
