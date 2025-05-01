// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Ecommerce Payment Contract
/// @dev Accepts payments, tracks orders, and allows owner to complete and withdraw

contract Ecommerce {
    address public owner;
    uint256 public totalOrders;

    struct Order {
        address buyer;
        uint256 amount;
        uint256 timestamp;
        bool isCompleted;
    }

    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public userOrders;

    event PaymentReceived(address indexed buyer, uint256 amount, uint256 orderId);
    event OrderCompleted(uint256 orderId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Accepts payment and creates an order
    function makePayment() external payable {
        require(msg.value > 0, "Payment amount must be greater than 0");

        uint256 orderId = totalOrders;
        totalOrders++;

        orders[orderId] = Order({
            buyer: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            isCompleted: false
        });

        userOrders[msg.sender].push(orderId);

        emit PaymentReceived(msg.sender, msg.value, orderId);
    }

    /// @notice Mark an order as completed (owner only)
    /// @param orderId The ID of the order to complete
    function completeOrder(uint256 orderId) external onlyOwner {
        require(orderId < totalOrders, "Invalid order ID");
        require(!orders[orderId].isCompleted, "Order already completed");

        orders[orderId].isCompleted = true;

        emit OrderCompleted(orderId);
    }

    /// @notice Withdraw all funds to the owner address
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        payable(owner).transfer(balance);
    }

    /// @notice Get order IDs for a specific user
    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }

    /// @notice Get order details by order ID
    function getOrderDetails(uint256 orderId)
        external
        view
        returns (
            address buyer,
            uint256 amount,
            uint256 timestamp,
            bool isCompleted
        )
    {
        require(orderId < totalOrders, "Invalid order ID");

        Order memory order = orders[orderId];
        return (order.buyer, order.amount, order.timestamp, order.isCompleted);
    }
}
