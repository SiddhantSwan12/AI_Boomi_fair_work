// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FairWorkEscrow.sol";

/**
 * @title Deploy Script for FairWorkEscrow
 * @notice Deploys the main escrow contract to Polygon Amoy testnet
 * @dev Run with: forge script script/Deploy.s.sol:DeployScript --rpc-url amoy --broadcast
 */
contract DeployScript is Script {
    // Polygon Amoy USDC address (testnet)
    // User's actual USDC token on Polygon Amoy
    address constant AMOY_USDC = 0x8B0180f2101c8260d49339abfEe87927412494B4;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy FairWorkEscrow
        FairWorkEscrow escrow = new FairWorkEscrow(AMOY_USDC);
        
        console.log("FairWorkEscrow deployed to:", address(escrow));
        console.log("USDC address:", AMOY_USDC);
        
        // Add some initial jurors for testing (you can add your own addresses)
        address deployer = vm.addr(deployerPrivateKey);
        escrow.addJuror(deployer);
        console.log("Added deployer as juror:", deployer);
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Complete ===");
        console.log("Add this to your .env.local:");
        console.log("NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=", address(escrow));
    }
}
