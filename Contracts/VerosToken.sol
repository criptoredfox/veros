pragma solidity ^0.4.4;
import "Token.sol";

contract VerosToken is Token {

    function VerosToken(
    address _genesisWalletAddress,
    address _mainWalletAddress,
    address _stakingWalletAddress,
    address _stakeholderWalletAddress,
    address _investorWalletAddress,
    address _feeWalletAddress) {
        owner = msg.sender;

        balances[_genesisWalletAddress] =  96 * blockSize * decimals;
        balances[_mainWalletAddress] =  blockSize * decimals;
        balances[_stakingWalletAddress] = blockSize * decimals;
        balances[_stakeholderWalletAddress] = blockSize * decimals;
        balances[_investorWalletAddress] = blockSize * decimals;

        totalSupply = 100 * blockSize * decimals;
        availableSupply = blockSize * decimals;
    }

    function setAvailableSupply(uint256 _availableSupply) returns (bool success) {
        if (msg.sender != owner) {
            return false;
        }
        availableSupply = _availableSupply;
        return true;
    }

    function transfer(address _to, uint256 _value) returns (bool success) {
        if (balances[msg.sender] >= _value && _value > 0) {
            if (balances[msg.sender] >= (_value + fee)) {
                balances[feeWalletAddress] += fee;
                balances[msg.sender] -= (_value + fee);
            } else {
                balances[msg.sender] -= _value;
            }

            balances[_to] += _value;
            Transfer(msg.sender, _to, _value);
            return true;
        } else {
            return false;
        }
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        if (balances[_from] >= (_value + fee) && childrens[_from] == msg.sender && _value > 0) {

            balances[feeWalletAddress] += fee;
            balances[_from] -= (_value + fee);
            balances[_to] += _value;

            Transfer(_from, _to, _value);
            return true;
        } else {
            return false;

        }
    }

    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function addChildrenAddress(address _children, address _parent) returns (bool success) {
        if (msg.sender != owner) {
            return false;
        }
        childrens[_children] = _parent;
        AddChildren(_parent, _children);
    }

    function removeChildrenAddress(address _children, address _parent) returns (bool success) {
        if (msg.sender != owner) {
            return false;
        }

        childrens[_children] = address(0x0);
        RemoveChildren(_parent, _children);
    }

    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }

    address feeWalletAddress;
    uint256 decimals = 100000;
    uint256 fee = 3000;
    uint256 blockSize = 100000000;

    address public owner;
    mapping (address => uint256) public balances;
    mapping (address => address) public childrens;
    mapping (address => mapping (address => uint256)) allowed;
}