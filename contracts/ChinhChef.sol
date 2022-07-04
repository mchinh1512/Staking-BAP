pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChinhChef is Ownable {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint amount;     
        uint rewardDebt; 
        uint accumulatedStakingPower; 
    }

    struct PoolInfo {
        IERC20 chinhToken;     
        IERC20 lpToken;       
        uint allocPoint;      
        uint lastRewardBlock;  
        uint accChinhPerShare; 
        bool isStarted; 
    }

    uint public chinhPerBlock;

    PoolInfo[] public poolInfo;

    mapping (uint => mapping (address => UserInfo)) public userInfo;

    uint public totalAllocPoint = 0;

    uint public startBlock;

    event Deposit(address indexed user, uint indexed pid, uint amount);
    event Withdraw(address indexed user, uint indexed pid, uint amount);
    event EmergencyWithdraw(address indexed user, uint indexed pid, uint amount);

    constructor(
        uint _chinhPerBlock,
        uint _startBlock
    ) public {
        chinhPerBlock = _chinhPerBlock;
        startBlock = _startBlock;
    }

    function poolLength() external view returns (uint) {
        return poolInfo.length;
    }

    function setChinhPerBlock(uint _chinhPerBlock) public onlyOwner {
        massUpdatePools();
        chinhPerBlock = _chinhPerBlock;
    }

    function checkPoolDuplicate(IERC20 _lpToken) internal view {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            require(poolInfo[pid].lpToken != _lpToken, "add: existing pool?");
        }
    }

    function add(uint _allocPoint,IERC20 _chinhToken, IERC20 _lpToken, bool _withUpdate, uint _lastRewardBlock) public onlyOwner {
        checkPoolDuplicate(_lpToken);
        if (_withUpdate) {
            massUpdatePools();
        }
        if (block.number < startBlock) {
            if (_lastRewardBlock == 0) {
                _lastRewardBlock = startBlock;
            } else {
                if (_lastRewardBlock < startBlock) {
                    _lastRewardBlock = startBlock;
                }
            }
        } else {
            if (_lastRewardBlock == 0 || _lastRewardBlock < block.number) {
                _lastRewardBlock = block.number;
            }
        }
        bool _isStarted = (_lastRewardBlock <= startBlock) || (_lastRewardBlock <= block.number);
        poolInfo.push(PoolInfo({
            chinhToken: _chinhToken,
            lpToken: _lpToken,
            allocPoint: _allocPoint,
            lastRewardBlock: _lastRewardBlock,
            accChinhPerShare: 0,
            isStarted: _isStarted
        }));
        if (_isStarted) {
            totalAllocPoint = totalAllocPoint.add(_allocPoint);
        }
    }

    function set(uint _pid, uint _allocPoint) public onlyOwner {
        massUpdatePools();
        PoolInfo storage pool = poolInfo[_pid];
        if (pool.isStarted) {
            totalAllocPoint = totalAllocPoint.sub(pool.allocPoint).add(_allocPoint);
        }
        pool.allocPoint = _allocPoint;
    }

    function pendingChinh(uint _pid, address _user) external view returns (uint) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint accChinhPerShare = pool.accChinhPerShare;
        uint lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint _numBlocks = block.number.sub(pool.lastRewardBlock);
            if (totalAllocPoint > 0) {
                uint _chinhReward = _numBlocks.mul(chinhPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
                accChinhPerShare = accChinhPerShare.add(_chinhReward.mul(1e12).div(lpSupply));
            }
        }
        return user.amount.mul(accChinhPerShare).div(1e12).sub(user.rewardDebt);
    }

    function massUpdatePools() public {
        uint length = poolInfo.length;
        for (uint pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    function updatePool(uint _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        if (!pool.isStarted) {
            pool.isStarted = true;
            totalAllocPoint = totalAllocPoint.add(pool.allocPoint);
        }
        if (totalAllocPoint > 0) {
            uint _numBlocks = block.number.sub(pool.lastRewardBlock);
            uint _chinhReward = _numBlocks.mul(chinhPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            pool.accChinhPerShare = pool.accChinhPerShare.add(_chinhReward.mul(1e12).div(lpSupply));
        }
        pool.lastRewardBlock = block.number;
    }

    function deposit(uint _pid, uint _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint pending = user.amount.mul(pool.accChinhPerShare).div(1e12).sub(user.rewardDebt);
            if(pending > 0) {
                user.accumulatedStakingPower = user.accumulatedStakingPower.add(pending);
            }
        }
        if(_amount > 0) {
            pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accChinhPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    function withdraw(uint _pid, uint _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint pending = user.amount.mul(pool.accChinhPerShare).div(1e12).sub(user.rewardDebt);
        if(pending > 0) {
            user.accumulatedStakingPower = user.accumulatedStakingPower.add(pending);
        }
        if(_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount.mul(pool.accChinhPerShare).div(1e12);
        emit Withdraw(msg.sender, _pid, _amount);
    }
}