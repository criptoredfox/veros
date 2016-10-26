pragma solidity ^0.4.2;
contract Veros {

    event Created(bytes32 indexed identifier);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    struct walletStruct {
        uint256 balance;
        uint blockedUntil;
        bool permanentBlocked;
    }

    mapping (address => walletStruct) balances;
    mapping (uint => address) accountIndex;
    uint _accountCount = 0;
    
    address _gasWallet;
    function getGasWalletAddress() constant returns (address walletAddress) {
        return _gasWallet;
    }

    address _genesisWallet;
    function getGenesisWalletAddress() constant returns (address walletAddress) {
        return _genesisWallet;
    }

    address _mainWallet;
    function getMainWalletAddress() constant returns (address walletAddress) {
        return _mainWallet;
    }
    
    address _stakingWallet;
    function getStakingWalletAddress() constant returns (address walletAddress) {
        return _stakingWallet;
    }
    
    address _stakeholderWallet;
    function getStakeholderWalletAddress() constant returns (address walletAddress) {
        return _stakeholderWallet;
    }
    
    address _investorWallet;
    function getInvestorWalletAddress() constant returns (address walletAddress) {
        return _investorWallet;
    }


    uint256 blockSize = 100000000;
    uint numberOfBlocks = 100;
    
    
    /* ----------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Constructor
     */

    function Veros(bytes32 identifier, 
    address gasWallet,
    address genesisWallet, 
    address mainWallet,
    address stakingWallet,
    address stakeholderWallet,
    address investorWallet) {
        Created(identifier);

        _gasWallet = gasWallet;
        _genesisWallet = genesisWallet;
        _mainWallet = mainWallet;
        _stakingWallet = stakingWallet;
        _stakeholderWallet = stakeholderWallet;
        _investorWallet = investorWallet;

        walletStruct memory genesisWalletData;
        genesisWalletData.balance = (numberOfBlocks-4) * blockSize;
        genesisWalletData.permanentBlocked = true;
        balances[_genesisWallet] = genesisWalletData;

        walletStruct memory mainWalletData;
        mainWalletData.balance = blockSize;
        mainWalletData.permanentBlocked = true;
        balances[_mainWallet] = mainWalletData;
        
        walletStruct memory stakingWalletData;
        stakingWalletData.balance = blockSize;
        stakingWalletData.permanentBlocked = true;
        balances[_stakingWallet] = stakingWalletData;
        
        walletStruct memory stakeholderWalletData;
        stakeholderWalletData.balance = blockSize;
        stakeholderWalletData.permanentBlocked = true;
        balances[_stakeholderWallet] = stakeholderWalletData;
        
        walletStruct memory investorWalletData;
        investorWalletData.balance = blockSize;
        investorWalletData.permanentBlocked = false;
        balances[_investorWallet] = investorWalletData;

        registerInternalAddress(_genesisWallet);
        registerInternalAddress(_mainWallet);
        registerInternalAddress(_stakingWallet);
        registerInternalAddress(_stakeholderWallet);
        registerInternalAddress(_investorWallet);
        
        saveTransaction(_genesisWallet, _mainWallet, blockSize);
        saveTransaction(_genesisWallet, _stakingWallet, blockSize);
        saveTransaction(_genesisWallet, _stakeholderWallet, blockSize);
        saveTransaction(_genesisWallet, _investorWallet, blockSize);
    }
    
    function registerAddress() {
        accountIndex[_accountCount] = msg.sender;
        _accountCount++;
    }
    
    function registerAddressFromDefault(address customerAddress) {
        if (msg.sender == _gasWallet) {
            accountIndex[_accountCount] = customerAddress;
            _accountCount++;            
        }
    }

    /*
     * Register a new address
     */
    function registerInternalAddress(address walletAddress) internal {
        accountIndex[_accountCount] = walletAddress;
        _accountCount++;
    }

    /*
     * Get VERO balance
     */
    function getBalance(address walletAddress) constant returns(uint) {
        walletStruct walletData = balances[walletAddress];
        return walletData.balance;
    }

    /* ----------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Address to IPv4
     */

     mapping (address => uint32) ips;

     function setIP(uint32 ip) {
         ips[msg.sender] = ip;
     }

     function deleteIP() {
         delete ips[msg.sender];
     }

     function getIP(address addr) returns (uint32) {
         return ips[addr];
     }


     /* ----------------------------------------------------------------------------------------------------------------------------------------------------------------
      * Explorer
      */

    function getTotalSupply() constant returns (uint256 totalSupply) {
        for (uint i=0;i<_accountCount;i++) {
            address accountAddress = accountIndex[i];
            walletStruct walletData = balances[accountAddress];
            totalSupply += walletData.balance;
        }
        return totalSupply;
    }

    function getAvailableSupply() constant returns (uint256 availableSupply) {
        for (uint i=0;i<_accountCount;i++) {
            address accountAddress = accountIndex[i];
            walletStruct walletData = balances[accountAddress];
            if (walletData.permanentBlocked != true) {
                availableSupply += walletData.balance;
            }
        }
        return availableSupply;
    }
    
    /* ----------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Transactions
     */
     
     function sendVeros(address recipient, uint amount) returns(bool sufficient) {
        walletStruct senderWalletData = balances[msg.sender];
        walletStruct recipientWalletData = balances[recipient];

        if (senderWalletData.balance < amount) {
            return false;
         }

        senderWalletData.balance -= amount;
        recipientWalletData.balance += amount;

        balances[msg.sender] = senderWalletData;
        balances[recipient] = recipientWalletData;

        saveTransaction(msg.sender, recipient, amount);

        return true;
    }
     
    struct transactionStruct {
        uint datetime;
        uint blockNumber;
        uint amount;
        address receiver;
        address sender;
    }

    mapping(uint256 => transactionStruct) _transactionList;
    uint _transactionCount = 0;

    function saveTransaction(address sender, address recipient, uint amount) internal {
        transactionStruct memory transactionItem;
        transactionItem.amount = amount;
        transactionItem.receiver = recipient;
        transactionItem.sender = sender;
        transactionItem.blockNumber = block.number;
        transactionItem.datetime = block.timestamp;

        _transactionList[_transactionCount] = transactionItem;
        _transactionCount++;
        Transfer(sender, recipient, amount);
    }

    function getTransactionCount() constant returns (uint transactionCount) {
        return _transactionCount;
    }
    
    function getTransactionCountForAddress(address searchAddress) constant returns (uint transactionCountForAddress) {
        for (uint transactionIndex = 0; transactionIndex < _transactionCount; transactionIndex++) {
            transactionStruct transactionItem = _transactionList[transactionIndex];
            if (transactionItem.receiver == searchAddress ||
                transactionItem.sender == searchAddress) {
                    transactionCountForAddress++;
                }
        }
        return transactionCountForAddress;
    }


    function getTransactionAmountWithIndex(uint transactionIndex) constant returns (uint amount) {
        transactionStruct transactionItem = _transactionList[transactionIndex];
        return transactionItem.amount;
    }

    function getTransactionDateWithIndex(uint transactionIndex) constant returns (uint datetime) {
        transactionStruct transactionItem = _transactionList[transactionIndex];
        return transactionItem.datetime;
    }

    function getTransactionSenderWithIndex(uint transactionIndex) constant returns (address sender) {
        transactionStruct transactionItem = _transactionList[transactionIndex];
        return transactionItem.sender;
    }

    function getTransactionRecipientWithIndex(uint transactionIndex) constant returns (address recipient) {
        transactionStruct transactionItem = _transactionList[transactionIndex];
        return transactionItem.receiver;
    }

    function getTransactionBlockNumberWithIndex(uint transactionIndex) constant returns (uint blockNumber) {
        transactionStruct transactionItem = _transactionList[transactionIndex];
        return transactionItem.blockNumber;
    }
    
    /* ----------------------------------------------------------------------------------------------------------------------------------------------------------------
     * Schedule Payments
     */    
     
    uint _scheduledPaymentIndex = 0;

    struct scheduledPaymentStruct {
        uint date;
        uint amount;
        address receiver;
    }

    mapping(uint256 => scheduledPaymentStruct) _scheduledPayments;
    uint[] _scheduledPaymentIndexes;

    function setSchedulePayment(address receiver, uint amount, uint date) returns (uint scheduledPaymentIndex) {
        
        if (msg.sender != _mainWallet) {
            return 0;
        }

        scheduledPaymentStruct memory sPaymentStruct;
        sPaymentStruct.amount = amount;
        sPaymentStruct.receiver = receiver;
        sPaymentStruct.date = date;

        _scheduledPayments[_scheduledPaymentIndex] = sPaymentStruct;
        _scheduledPaymentIndexes.push(_scheduledPaymentIndex);
        _scheduledPaymentIndex++;

        return _scheduledPaymentIndex;
    }

    function getSchedulePaymentAddress(uint scheduledPaymentIndex) constant returns (address scheduledPaymentAddress) {
        scheduledPaymentStruct sPaymentStruct = _scheduledPayments[scheduledPaymentIndex];
        return sPaymentStruct.receiver;
    }

    function getSchedulePaymentAmount(uint scheduledPaymentIndex) constant returns (uint scheduledPaymentAmount) {
        scheduledPaymentStruct sPaymentStruct = _scheduledPayments[scheduledPaymentIndex];
        return sPaymentStruct.amount;
    }

    function getSchedulePaymentDate(uint scheduledPaymentIndex) constant returns (uint scheduledPaymentDate) {
        scheduledPaymentStruct sPaymentStruct = _scheduledPayments[scheduledPaymentIndex];
        return sPaymentStruct.date;
    }

    function getScheduledPaymentIndex() constant returns (uint scheduledPaymentIndex) {
        return _scheduledPaymentIndex;
    }

    function getPaymentAtIndex(uint index) constant returns (uint paymentIndex) {
        return _scheduledPaymentIndexes[index];
    }
    
    function getScheduledPaymentsActiveCount() constant returns (uint scheduledPaymentsCount) {
        uint paymentsRunCount = 0;
        for (uint i = 0; i<_scheduledPaymentIndex;i++) {
            scheduledPaymentStruct sPaymentStruct = _scheduledPayments[i];
            uint currentTime = getCurrentTime();
            if (sPaymentStruct.date<currentTime && sPaymentStruct.date > 0) {
                paymentsRunCount++;
            }
        }
        return paymentsRunCount;
    }
    
    function getCurrentTime() constant returns (uint currentTime) {
        currentTime = block.timestamp;
        return currentTime;
    }

    function runScheduledPayments()  {
        uint paymentsRunCount = 0;
        for (uint i = 0; i<_scheduledPaymentIndex;i++) {
            scheduledPaymentStruct sPaymentStruct = _scheduledPayments[i];
            uint currentTime = block.timestamp;
            if (sPaymentStruct.date<currentTime && sPaymentStruct.date > 0) {
                address receiver = sPaymentStruct.receiver;
                uint amount = sPaymentStruct.amount;

                walletStruct mainWalletData = balances[_mainWallet];
                mainWalletData.balance -= amount;
                balances[_mainWallet] = mainWalletData;
                
                walletStruct receiverWalletData = balances[receiver];
                receiverWalletData.balance += amount;
                balances[receiver] = receiverWalletData;
                
                saveTransaction(_mainWallet, receiver, amount);
                paymentsRunCount++;

                delete _scheduledPayments[i];
            }
        }
    }     
}