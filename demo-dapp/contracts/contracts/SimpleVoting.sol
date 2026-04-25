// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleVoting {
    struct Proposal {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public owner;
    Proposal[] public proposals;
    mapping(address => bool) public hasVoted;

    event ProposalCreated(uint256 indexed id, string name);
    event Voted(address indexed voter, uint256 indexed proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createProposal(string calldata name) external onlyOwner {
        uint256 id = proposals.length;
        proposals.push(Proposal({ id: id, name: name, voteCount: 0 }));
        emit ProposalCreated(id, name);
    }

    function vote(uint256 proposalId) external {
        require(!hasVoted[msg.sender], "Already voted");
        require(proposalId < proposals.length, "Invalid proposal");
        hasVoted[msg.sender] = true;
        proposals[proposalId].voteCount += 1;
        emit Voted(msg.sender, proposalId);
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }
}
