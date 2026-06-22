// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FairWorkEscrow.sol";

/**
 * @title Deploy Script for FairWorkEscrow (with Chainlink VRF v2.5)
 *
 * Prerequisites:
 *   1. Create a VRF subscription at https://vrf.chain.link (select Polygon Amoy)
 *   2. Fund the subscription with test LINK from https://faucets.chain.link
 *   3. Set env vars in .env.local:
 *        PRIVATE_KEY=<deployer private key>
 *        VRF_SUBSCRIPTION_ID=<your subscription ID>
 *
 * Deploy:
 *   forge script script/Deploy.s.sol:DeployScript --rpc-url amoy --broadcast
 *
 * After deploy:
 *   - Copy the printed contract address to .env.local as NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS
 *   - Go to vrf.chain.link -> your subscription -> Add Consumer -> paste the contract address
 */
contract DeployScript is Script {
    // Polygon Amoy addresses
    address constant AMOY_USDC       = 0x8B0180f2101c8260d49339abfEe87927412494B4;
    address constant VRF_COORDINATOR = 0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2;
    bytes32 constant KEY_HASH        = 0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 vrfSubscriptionId  = vm.envUint("VRF_SUBSCRIPTION_ID");

        vm.startBroadcast(deployerPrivateKey);

        FairWorkEscrow escrow = new FairWorkEscrow(
            AMOY_USDC,
            VRF_COORDINATOR,
            vrfSubscriptionId,
            KEY_HASH
        );

        console.log("FairWorkEscrow deployed to:", address(escrow));
        console.log("VRF Coordinator:           ", VRF_COORDINATOR);
        console.log("Subscription ID:           ", vrfSubscriptionId);

        // Add deployer as initial juror for testing
        address deployer = vm.addr(deployerPrivateKey);
        escrow.addJuror(deployer);
        console.log("Added deployer as juror:   ", deployer);

        vm.stopBroadcast();

        console.log("\n=== Next Steps ===");
        console.log("1. Add to .env.local:");
        console.log("   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=", address(escrow));
        console.log("2. Go to vrf.chain.link -> your subscription -> Add Consumer:");
        console.log("  ", address(escrow));
    }
}
