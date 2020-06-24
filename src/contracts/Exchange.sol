pragma solidity ^0.5.0;

import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
    }
}
