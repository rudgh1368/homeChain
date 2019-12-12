pragma solidity ^0.5.1;

contract bankCheck{
    function recoverAddress(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) internal pure returns(address) {
        return ecrecover(msgHash, v, r, s);
    }

    // check BalanceProof
    function checkBankkey(address bankAddress, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) internal pure returns(bool){
        return bankAddress == recoverAddress(msgHash, v, r, s);
    }
}