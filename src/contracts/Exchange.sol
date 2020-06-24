pragma solidity ^0.5.0;

contract Exchange {
    address public feeAccount;

    constructor(address _feeAccount) public {
        feeAccount = _feeAccount;
    }
}
