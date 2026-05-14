/**
 * Merkle tree — built to match Verify.sol exactly.
 *
 * Hashing scheme (mirrors Verify.sol _hash):
 *   leaf:   keccak256(raw_document_bytes)
 *   parent: keccak256(abi.encodePacked(left_bytes32, right_bytes32))
 *   odd leaves: duplicate the last leaf
 *
 * Uses keccak256 from viem — synchronous, works in both Node.js and browser.
 */

import { keccak256, concat, type Hex } from "viem";

export interface MerkleTree {
  levels: Hex[][];  // levels[0] = leaf hashes, levels[last] = [root]
  root: Hex;        // 0x-prefixed bytes32
}

export interface MerkleProof {
  leaf: Hex;        // keccak256 of the document bytes
  proof: Hex[];     // sibling hashes, leaf → root order
  isLeft: boolean[]; // isLeft[i]=true → proof[i] is the LEFT sibling
}

// keccak256 of two packed bytes32 values — matches Verify.sol _hash(a, b)
function concatHash(left: Hex, right: Hex): Hex {
  return keccak256(concat([left, right]));
}

// Hash a document's raw bytes → bytes32
// Browser: pass new Uint8Array(await file.arrayBuffer())
// Server:  pass Buffer.from(fileContent)
export function hashDocument(content: Uint8Array): Hex {
  return keccak256(content);
}

// Hash a UTF-8 string directly (convenience for text files / testing)
export function hashString(content: string): Hex {
  return hashDocument(new TextEncoder().encode(content));
}

// Build a Merkle tree from raw document bytes (hashes each one first)
export function buildMerkleTree(data: Uint8Array[]): MerkleTree {
  if (data.length === 0) throw new Error("No data provided to build tree");
  return buildTreeFromHashes(data.map(hashDocument));
}

// Build a Merkle tree from pre-hashed leaves (used when reconstructing from Supabase)
export function buildTreeFromHashes(hashes: Hex[]): MerkleTree {
  if (hashes.length === 0) throw new Error("No hashes provided");

  let current = [...hashes];
  const levels: Hex[][] = [current];

  while (current.length > 1) {
    const next: Hex[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = i + 1 < current.length ? current[i + 1] : left; // duplicate last if odd
      next.push(concatHash(left, right));
    }
    levels.push(next);
    current = next;
  }

  return { levels, root: current[0] };
}

// Generate a Merkle inclusion proof for the leaf at leafIndex
export function getProof(tree: MerkleTree, leafIndex: number): MerkleProof {
  const { levels } = tree;
  if (leafIndex < 0 || leafIndex >= levels[0].length) {
    throw new Error(`Leaf index ${leafIndex} out of range (tree has ${levels[0].length} leaves)`);
  }

  const leaf = levels[0][leafIndex];
  const proof: Hex[] = [];
  const isLeft: boolean[] = [];

  let idx = leafIndex;
  for (let lvl = 0; lvl < levels.length - 1; lvl++) {
    const nodes = levels[lvl];
    const isRightChild = idx % 2 === 1;

    if (isRightChild) {
      // current is right child → sibling is on the LEFT
      proof.push(nodes[idx - 1]);
      isLeft.push(true);
    } else {
      // current is left child → sibling is on the RIGHT (or duplicate if last)
      const sibIdx = idx + 1 < nodes.length ? idx + 1 : idx;
      proof.push(nodes[sibIdx]);
      isLeft.push(false);
    }

    idx = Math.floor(idx / 2);
  }

  return { leaf, proof, isLeft };
}

// Verify a Merkle proof — mirrors Verify.sol verify() exactly
export function verifyProof(
  rootHash: Hex,
  leaf: Hex,
  proof: Hex[],
  isLeft: boolean[]
): boolean {
  if (proof.length !== isLeft.length) return false;

  let current = leaf;
  for (let i = 0; i < proof.length; i++) {
    current = isLeft[i]
      ? concatHash(proof[i], current)  // sibling is left
      : concatHash(current, proof[i]); // sibling is right
  }

  return current === rootHash;
}
