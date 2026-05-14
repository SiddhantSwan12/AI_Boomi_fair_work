// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {VerifyPublic} from "../src/Verify.sol";

contract DeployVerify is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        VerifyPublic verify = new VerifyPublic();
        vm.stopBroadcast();

        console2.log("VerifyPublic deployed at:", address(verify));
        console2.log("\nAdd to .env.local:");
        console2.log("NEXT_PUBLIC_VERIFY_ADDRESS=", address(verify));
    }
}
