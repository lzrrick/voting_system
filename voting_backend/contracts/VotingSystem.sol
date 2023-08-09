// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/utils/Strings.sol";

error NotOwner();
error VoteNotExist();
error VotClosed();
error CandidateNotExist();
error ALreadyVote();
error HaveSameCandidates();

contract VotingSystem {
    enum States {
        close,
        open
    }
    struct Vote {
        address owner;
        States state;
        uint256 number;
        string title;
        string description;
        string[] candidates;
        uint256[] vote_getting;
        address[] voter;
    }

    event VoteCreated(address indexed owner, uint256 vote_number);

    uint256 private total_vote;
    Vote[] public vote_list;
    mapping(address => uint256[]) private owners;

    /////////////////////
    // Modifiers       //
    /////////////////////

    modifier isOwner(uint256 index, address sender) {
        address owner = vote_list[index].owner;
        if (sender != owner) {
            revert NotOwner();
        }
        _;
    }

    modifier isVoteExist(uint256 index) {
        if (index >= total_vote || index < 0) {
            revert VoteNotExist();
        }
        _;
    }

    modifier isVoteOpen(uint256 index) {
        if (index >= total_vote || index < 0) {
            revert VoteNotExist();
        }
        if (vote_list[index].state == States.close) {
            revert VotClosed();
        }
        _;
    }

    modifier isCandidateExist(uint256 vote_index, uint256 candidate_index) {
        if (vote_index >= total_vote || vote_index < 0) {
            revert VoteNotExist();
        }
        if (candidate_index >= vote_list[vote_index].candidates.length || candidate_index < 0) {
            revert CandidateNotExist();
        }
        _;
    }

    modifier sameCandidate(string[] memory candidates) {
        for (uint256 i = 0; i < candidates.length; i++) {
            for (uint256 j = i + 1; j < candidates.length; j++) {
                if (isEqual(candidates[i], candidates[j])) {
                    revert HaveSameCandidates();
                }
            }
        }
        _;
    }

    constructor() {}

    /////////////////////
    // Main Functions  //
    /////////////////////

    function createVote(
        string memory title,
        string memory description,
        string[] memory candidates
    ) external sameCandidate(candidates) {
        uint256[] memory vote_getting = new uint256[](candidates.length);
        address[] memory voter = new address[](0);
        Vote memory vote = Vote(
            msg.sender,
            States.open,
            total_vote,
            title,
            description,
            candidates,
            vote_getting,
            voter
        );
        vote_list.push(vote);
        owners[msg.sender].push(vote.number);
        emit VoteCreated(msg.sender, vote.number);
        total_vote++;
    }

    function closeVote(uint256 index) external isVoteExist(index) isOwner(index, msg.sender) {
        vote_list[index].state = States.close;
    }

    function executeVote(
        uint256 vote_index,
        uint256 candidate_index
    ) external isVoteOpen(vote_index) isCandidateExist(vote_index, candidate_index) {
        for (uint256 i = 0; i < vote_list[vote_index].voter.length; i++) {
            if (vote_list[vote_index].voter[i] == msg.sender) {
                revert ALreadyVote();
            }
        }
        vote_list[vote_index].voter.push(msg.sender);
        vote_list[vote_index].vote_getting[candidate_index] += 1;
    }

    //////////////////////
    // utils            //
    //////////////////////

    function isEqual(string memory a, string memory b) public pure returns (bool) {
        bytes memory aa = bytes(a);
        bytes memory bb = bytes(b);
        if (aa.length != bb.length) return false;
        for (uint i = 0; i < aa.length; i++) {
            if (aa[i] != bb[i]) return false;
        }

        return true;
    }

    function VoteToJson(Vote memory vote) internal pure returns (string memory) {
        string memory json_vote = "{";

        string memory owner = '"owner":"';
        owner = string(abi.encodePacked(owner, Strings.toHexString(vote.owner)));
        owner = string(abi.encodePacked(owner, '",'));
        json_vote = string(abi.encodePacked(json_vote, owner));

        string memory state = '"state":';
        state = string(abi.encodePacked(state, Strings.toString(uint256(vote.state))));
        state = string(abi.encodePacked(state, ","));
        json_vote = string(abi.encodePacked(json_vote, state));

        string memory number = '"number":';
        number = string(abi.encodePacked(number, Strings.toString(vote.number)));
        number = string(abi.encodePacked(number, ","));
        json_vote = string(abi.encodePacked(json_vote, number));

        string memory title = '"title":"';
        title = string(abi.encodePacked(title, vote.title));
        title = string(abi.encodePacked(title, '",'));
        json_vote = string(abi.encodePacked(json_vote, title));

        string memory description = '"description":"';
        description = string(abi.encodePacked(description, vote.description));
        description = string(abi.encodePacked(description, '",'));
        json_vote = string(abi.encodePacked(json_vote, description));

        string memory candidates = '"candidates":[';
        for (uint256 i = 0; i < vote.candidates.length; i++) {
            candidates = string(abi.encodePacked(candidates, '"'));
            candidates = string(abi.encodePacked(candidates, vote.candidates[i]));
            candidates = string(abi.encodePacked(candidates, '"'));

            if (i != vote.vote_getting.length - 1) {
                candidates = string(abi.encodePacked(candidates, ","));
            }
        }
        candidates = string(abi.encodePacked(candidates, "],"));
        json_vote = string(abi.encodePacked(json_vote, candidates));

        string memory vote_getting = '"vote_getting":[';
        for (uint256 i = 0; i < vote.vote_getting.length; i++) {
            vote_getting = string(
                abi.encodePacked(vote_getting, Strings.toString(vote.vote_getting[i]))
            );
            if (i != vote.vote_getting.length - 1) {
                vote_getting = string(abi.encodePacked(vote_getting, ","));
            }
        }
        vote_getting = string(abi.encodePacked(vote_getting, "]"));
        json_vote = string(abi.encodePacked(json_vote, vote_getting));

        json_vote = string(abi.encodePacked(json_vote, "}"));
        return json_vote;
    }

    //////////////////////
    // Getter Functions //
    //////////////////////

    function getTotalVote() external view returns (uint256) {
        return total_vote;
    }

    function getVoteList() external view returns (Vote[] memory) {
        return vote_list;
    }

    function getOwnersVote() external view returns (Vote[] memory) {
        Vote[] memory owner_votes = new Vote[](owners[msg.sender].length);
        for (uint256 i = 0; i < owners[msg.sender].length; i++) {
            owner_votes[i] = vote_list[owners[msg.sender][i]];
        }
        return owner_votes;
    }

    function getOwnersVoteIndex() external view returns (uint256[] memory) {
        return owners[msg.sender];
    }

    function getSingleVote(uint256 index) external view isVoteExist(index) returns (Vote memory) {
        return vote_list[index];
    }

    function getSingleVoteJson(
        uint256 index
    ) external view isVoteExist(index) returns (string memory) {
        return VoteToJson(vote_list[index]);
    }

    function getSingleVoteDescribeJson(
        uint256 index
    ) external view isVoteExist(index) returns (string memory) {
        string memory json_vote = "{";

        string memory owner = '"owner":"';
        owner = string(abi.encodePacked(owner, Strings.toHexString(vote_list[index].owner)));
        owner = string(abi.encodePacked(owner, '",'));
        json_vote = string(abi.encodePacked(json_vote, owner));

        string memory state = '"state":';
        state = string(abi.encodePacked(state, Strings.toString(uint256(vote_list[index].state))));
        state = string(abi.encodePacked(state, ","));
        json_vote = string(abi.encodePacked(json_vote, state));

        string memory number = '"number":';
        number = string(abi.encodePacked(number, Strings.toString(vote_list[index].number)));
        number = string(abi.encodePacked(number, ","));
        json_vote = string(abi.encodePacked(json_vote, number));

        string memory title = '"title":"';
        title = string(abi.encodePacked(title, vote_list[index].title));
        title = string(abi.encodePacked(title, '",'));
        json_vote = string(abi.encodePacked(json_vote, title));

        string memory description = '"description":"';
        description = string(abi.encodePacked(description, vote_list[index].description));
        json_vote = string(abi.encodePacked(json_vote, description));

        json_vote = string(abi.encodePacked(json_vote, '"}'));
        return json_vote;
    }

    function getSingleVoteContentJson(
        uint256 index
    ) external view isVoteExist(index) returns (string memory) {
        string memory json_vote = "{";

        string memory candidates = '"candidates":[';
        for (uint256 i = 0; i < vote_list[index].candidates.length; i++) {
            candidates = string(abi.encodePacked(candidates, '"'));
            candidates = string(abi.encodePacked(candidates, vote_list[index].candidates[i]));
            candidates = string(abi.encodePacked(candidates, '"'));

            if (i != vote_list[index].vote_getting.length - 1) {
                candidates = string(abi.encodePacked(candidates, ","));
            }
        }
        candidates = string(abi.encodePacked(candidates, "],"));
        json_vote = string(abi.encodePacked(json_vote, candidates));

        string memory vote_getting = '"vote_getting":[';
        for (uint256 i = 0; i < vote_list[index].vote_getting.length; i++) {
            vote_getting = string(
                abi.encodePacked(vote_getting, Strings.toString(vote_list[index].vote_getting[i]))
            );
            if (i != vote_list[index].vote_getting.length - 1) {
                vote_getting = string(abi.encodePacked(vote_getting, ","));
            }
        }
        vote_getting = string(abi.encodePacked(vote_getting, "]"));
        json_vote = string(abi.encodePacked(json_vote, vote_getting));

        json_vote = string(abi.encodePacked(json_vote, "}"));
        return json_vote;
    }
}
