// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title FairWorkEscrow
 * @notice Main escrow contract for FairWork platform
 * @dev Handles job creation, deliverable submission, disputes, and fund distribution.
 *      Juror selection uses Chainlink VRF v2.5 for provably fair randomness.
 */
contract FairWorkEscrow is ReentrancyGuard, Pausable, VRFConsumerBaseV2Plus {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;

    // ── Chainlink VRF v2.5 ────────────────────────────────────────────────────
    uint256 public subscriptionId;
    bytes32 public keyHash;
    uint32  public constant CALLBACK_GAS_LIMIT    = 200_000;
    uint16  public constant REQUEST_CONFIRMATIONS  = 3;
    uint32  public constant NUM_WORDS              = 1;

    // requestId (returned by VRF coordinator) → disputeId
    mapping(uint256 => uint256) public vrfRequestToDispute;

    // ── Job / dispute state ───────────────────────────────────────────────────
    uint256 public jobCounter;
    uint256 public disputeCounter;
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant JUROR_COUNT = 3;

    enum JobStatus {
        OPEN,
        ACCEPTED,
        SUBMITTED,
        APPROVED,
        DISPUTED,
        RESOLVED,
        CANCELLED
    }

    enum DisputeStatus {
        ACTIVE,
        RESOLVED
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        uint256 deadline;
        string descriptionHash;
        string deliverableHash;
        JobStatus status;
        uint256 createdAt;
    }

    struct Dispute {
        uint256 id;
        uint256 jobId;
        address raisedBy;
        string evidenceHash;
        address[] jurors;
        mapping(address => bool) hasVoted;
        uint256 votesForClient;
        uint256 votesForFreelancer;
        DisputeStatus status;
        address winner;
        uint256 createdAt;
    }

    mapping(uint256 => Job)     public jobs;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public jobToDispute;

    address[] public juryPool;
    mapping(address => bool) public isJuror;

    // ── Events ────────────────────────────────────────────────────────────────
    event JobCreated(uint256 indexed jobId, address indexed client, uint256 amount, uint256 deadline);
    event JobAccepted(uint256 indexed jobId, address indexed freelancer);
    event DeliverableSubmitted(uint256 indexed jobId, string deliverableHash);
    event JobApproved(uint256 indexed jobId);
    event DisputeRaised(uint256 indexed disputeId, uint256 indexed jobId, address indexed raisedBy);
    event JurorSelectionRequested(uint256 indexed disputeId, uint256 indexed requestId);
    event JurorsSelected(uint256 indexed disputeId, address[] jurors);
    event VoteCast(uint256 indexed disputeId, address indexed juror, bool votedForClient);
    event DisputeResolved(uint256 indexed disputeId, address indexed winner);
    event FundsReleased(uint256 indexed jobId, address indexed recipient, uint256 amount);
    event JobCancelled(uint256 indexed jobId, address indexed client, uint256 refundAmount);

    // ── Constructor ───────────────────────────────────────────────────────────

    /**
     * @param _usdc             USDC token address
     * @param _vrfCoordinator   Chainlink VRF v2.5 coordinator (Polygon Amoy: 0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2)
     * @param _subscriptionId   Chainlink VRF subscription ID (create at vrf.chain.link)
     * @param _keyHash          Gas lane key hash for Polygon Amoy
     */
    constructor(
        address _usdc,
        address _vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        usdc = IERC20(_usdc);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    // ── Job lifecycle ─────────────────────────────────────────────────────────

    function createJob(
        uint256 _amount,
        uint256 _deadline,
        string calldata _descriptionHash
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(_amount > 0, "Amount must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(bytes(_descriptionHash).length > 0, "Description hash required");

        usdc.safeTransferFrom(msg.sender, address(this), _amount);

        uint256 jobId = jobCounter++;
        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: address(0),
            amount: _amount,
            deadline: _deadline,
            descriptionHash: _descriptionHash,
            deliverableHash: "",
            status: JobStatus.OPEN,
            createdAt: block.timestamp
        });

        emit JobCreated(jobId, msg.sender, _amount, _deadline);
        return jobId;
    }

    function acceptJob(uint256 _jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.OPEN, "Job not open");
        require(job.client != msg.sender, "Client cannot accept own job");
        require(block.timestamp < job.deadline, "Job deadline passed");

        job.freelancer = msg.sender;
        job.status = JobStatus.ACCEPTED;

        emit JobAccepted(_jobId, msg.sender);
    }

    function submitDeliverable(
        uint256 _jobId,
        string calldata _deliverableHash
    ) external nonReentrant whenNotPaused {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.ACCEPTED, "Job not accepted");
        require(job.freelancer == msg.sender, "Only freelancer can submit");
        require(bytes(_deliverableHash).length > 0, "Deliverable hash required");

        job.deliverableHash = _deliverableHash;
        job.status = JobStatus.SUBMITTED;

        emit DeliverableSubmitted(_jobId, _deliverableHash);
    }

    function approveJob(uint256 _jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.SUBMITTED, "Job not submitted");
        require(job.client == msg.sender, "Only client can approve");

        job.status = JobStatus.APPROVED;

        uint256 platformFee = (job.amount * PLATFORM_FEE_BPS) / 10000;
        uint256 freelancerPayment = job.amount - platformFee;

        usdc.safeTransfer(job.freelancer, freelancerPayment);
        usdc.safeTransfer(owner(), platformFee);

        emit JobApproved(_jobId);
        emit FundsReleased(_jobId, job.freelancer, freelancerPayment);
    }

    function cancelJob(uint256 _jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Only client can cancel");
        require(job.status == JobStatus.OPEN, "Can only cancel open jobs");

        job.status = JobStatus.CANCELLED;
        uint256 refundAmount = job.amount;

        usdc.safeTransfer(job.client, refundAmount);

        emit JobCancelled(_jobId, msg.sender, refundAmount);
        emit FundsReleased(_jobId, msg.sender, refundAmount);
    }

    // ── Dispute lifecycle ─────────────────────────────────────────────────────

    /**
     * @notice Raise a dispute. Records the dispute on-chain and sends a
     *         Chainlink VRF request. Jurors are assigned when VRF fulfills
     *         (~3 block confirmations later via fulfillRandomWords).
     */
    function raiseDispute(
        uint256 _jobId,
        string calldata _evidenceHash
    ) external nonReentrant whenNotPaused returns (uint256) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.SUBMITTED, "Job not submitted");
        require(
            msg.sender == job.client || msg.sender == job.freelancer,
            "Only parties can raise dispute"
        );
        require(bytes(_evidenceHash).length > 0, "Evidence hash required");
        require(juryPool.length >= JUROR_COUNT, "Not enough jurors in pool");

        job.status = JobStatus.DISPUTED;

        uint256 disputeId = disputeCounter++;
        Dispute storage dispute = disputes[disputeId];
        dispute.id        = disputeId;
        dispute.jobId     = _jobId;
        dispute.raisedBy  = msg.sender;
        dispute.evidenceHash = _evidenceHash;
        dispute.status    = DisputeStatus.ACTIVE;
        dispute.createdAt = block.timestamp;

        jobToDispute[_jobId] = disputeId;

        // Request provably fair randomness from Chainlink VRF v2.5
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash:             keyHash,
                subId:               subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit:    CALLBACK_GAS_LIMIT,
                numWords:            NUM_WORDS,
                extraArgs:           VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({ nativePayment: false })
                )
            })
        );

        vrfRequestToDispute[requestId] = disputeId;

        emit DisputeRaised(disputeId, _jobId, msg.sender);
        emit JurorSelectionRequested(disputeId, requestId);

        return disputeId;
    }

    /**
     * @notice Called by Chainlink VRF coordinator with verified randomness.
     *         Uses the random word to pick 3 jurors from the jury pool.
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint256 disputeId = vrfRequestToDispute[requestId];
        Dispute storage dispute = disputes[disputeId];

        require(dispute.jurors.length == 0, "Jurors already selected");

        address[] memory selected = _selectJurorsWithSeed(randomWords[0]);
        dispute.jurors = selected;

        emit JurorsSelected(disputeId, selected);
    }

    function castVote(uint256 _disputeId, bool _voteForClient) external nonReentrant whenNotPaused {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.status == DisputeStatus.ACTIVE, "Dispute not active");
        require(dispute.jurors.length == JUROR_COUNT, "Jurors not yet selected");
        require(_isJurorForDispute(_disputeId, msg.sender), "Not a juror for this dispute");
        require(!dispute.hasVoted[msg.sender], "Already voted");

        dispute.hasVoted[msg.sender] = true;

        if (_voteForClient) {
            dispute.votesForClient++;
        } else {
            dispute.votesForFreelancer++;
        }

        emit VoteCast(_disputeId, msg.sender, _voteForClient);

        if (dispute.votesForClient + dispute.votesForFreelancer == JUROR_COUNT) {
            _resolveDispute(_disputeId);
        }
    }

    function _resolveDispute(uint256 _disputeId) internal {
        Dispute storage dispute = disputes[_disputeId];
        Job storage job = jobs[dispute.jobId];

        dispute.status = DisputeStatus.RESOLVED;
        job.status = JobStatus.RESOLVED;

        address winner = dispute.votesForClient > dispute.votesForFreelancer
            ? job.client
            : job.freelancer;

        dispute.winner = winner;

        uint256 platformFee = (job.amount * PLATFORM_FEE_BPS) / 10000;
        uint256 winnerPayment = job.amount - platformFee;

        usdc.safeTransfer(winner, winnerPayment);
        usdc.safeTransfer(owner(), platformFee);

        emit DisputeResolved(_disputeId, winner);
        emit FundsReleased(dispute.jobId, winner, winnerPayment);
    }

    // ── Jury pool management ──────────────────────────────────────────────────

    function addJuror(address _juror) external onlyOwner {
        require(!isJuror[_juror], "Already a juror");
        juryPool.push(_juror);
        isJuror[_juror] = true;
    }

    // ── VRF config management ─────────────────────────────────────────────────

    function setSubscriptionId(uint256 _subscriptionId) external onlyOwner {
        subscriptionId = _subscriptionId;
    }

    function setKeyHash(bytes32 _keyHash) external onlyOwner {
        keyHash = _keyHash;
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    /**
     * @notice Select JUROR_COUNT unique jurors using a VRF-provided seed.
     *         The seed comes from Chainlink — not influenceable by any on-chain actor.
     */
    function _selectJurorsWithSeed(uint256 seed) internal view returns (address[] memory) {
        uint256 poolSize = juryPool.length;
        address[] memory selected = new address[](JUROR_COUNT);
        uint256 selectedCount = 0;
        uint256 nonce = 0;

        while (selectedCount < JUROR_COUNT) {
            uint256 index = uint256(keccak256(abi.encodePacked(seed, nonce))) % poolSize;
            address candidate = juryPool[index];
            nonce++;

            bool isDuplicate = false;
            for (uint256 j = 0; j < selectedCount; j++) {
                if (selected[j] == candidate) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                selected[selectedCount] = candidate;
                selectedCount++;
            }
        }

        return selected;
    }

    function _isJurorForDispute(uint256 _disputeId, address _juror) internal view returns (bool) {
        Dispute storage dispute = disputes[_disputeId];
        for (uint256 i = 0; i < dispute.jurors.length; i++) {
            if (dispute.jurors[i] == _juror) return true;
        }
        return false;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function emergencyWithdraw(address _recipient, uint256 _amount) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        require(_amount <= usdc.balanceOf(address(this)), "Insufficient balance");
        usdc.safeTransfer(_recipient, _amount);
        emit FundsReleased(0, _recipient, _amount);
    }

    // ── View functions ────────────────────────────────────────────────────────

    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }

    function getDisputeJurors(uint256 _disputeId) external view returns (address[] memory) {
        return disputes[_disputeId].jurors;
    }

    function getDisputeVotes(uint256 _disputeId) external view returns (uint256, uint256) {
        Dispute storage dispute = disputes[_disputeId];
        return (dispute.votesForClient, dispute.votesForFreelancer);
    }
}
