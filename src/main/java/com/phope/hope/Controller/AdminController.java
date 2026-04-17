package com.phope.hope.Controller;

import com.phope.hope.DTO.DashboardStatsDTO;
import com.phope.hope.DTO.TransactionResponseDTO;
import com.phope.hope.Entity.Order;
import com.phope.hope.Entity.OrderStatus;
import com.phope.hope.Entity.Transaction;
import com.phope.hope.Repository.TransactionRepository;
import com.phope.hope.Service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.phope.hope.DTO.UserBalanceDTO;
import com.phope.hope.DTO.UserDetailsDTO;
import com.phope.hope.DTO.TransactionResponseDTO;
import com.phope.hope.Entity.*;
import com.phope.hope.Repository.*;
import java.math.BigDecimal;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final OrderRepository orderRepository;

    public AdminController(AdminService adminService, TransactionRepository transactionRepository, UserRepository userRepository, AccountRepository accountRepository, OrderRepository orderRepository) {
        this.adminService = adminService;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserBalanceDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserBalanceDTO> userBalances = users.stream()
                .map(user -> {
                    UserBalanceDTO dto = new UserBalanceDTO();
                    dto.setUserId(user.getId());
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setRole(user.getRole().name());

                    // Get total balance across all accounts
                    BigDecimal totalBalance = user.getAccounts().stream()
                            .map(Account::getBalance)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    dto.setTotalBalance(totalBalance);
                    dto.setAccountCount(user.getAccounts().size());

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(userBalances);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDetailsDTO> getUserDetails(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetailsDTO dto = new UserDetailsDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setAccounts(user.getAccounts());

        // Get user's orders
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        dto.setTotalOrders(orders.size());

        BigDecimal totalSpent = orders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID ||
                        o.getPaymentStatus() == PaymentStatus.RELEASED)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalSpent(totalSpent);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStatsDTO() {
        DashboardStatsDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/orders/pending-escrow")
    public List<Order> getPendingOrders() {
        return adminService.getPendingEscrowOrders();
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        List<Order> orders = adminService.getOrdersByStatus(orderStatus);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponseDTO>> getAllTransactions() {
        List<Transaction> transaction = transactionRepository.findAll();
        List<TransactionResponseDTO> dtos = transaction.stream()
                .map(this:: mapTransactionToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);

    }

    @GetMapping("/transactions/type/{type}")
    public ResponseEntity<List<TransactionResponseDTO>> getTransactionsByType(@PathVariable String type) {
        TransactionType transactionType = TransactionType.valueOf(type.toUpperCase());
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> t.getType() == transactionType)
                .collect(Collectors.toList());

        List<TransactionResponseDTO> dtos = transactions.stream()
                .map(this::mapTransactionToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private TransactionResponseDTO mapTransactionToDTO(Transaction transaction) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(transaction.getId());
        dto.setFromAccountNumber(
                transaction.getFrom() != null ? transaction.getFrom().getAccountNumber() : 0
        );
        dto.setToAccountNumber(
                transaction.getTo() != null ? transaction.getTo().getAccountNumber() : 0
        );
        dto.setAmount(transaction.getAmount());
        dto.setStatus(transaction.getStatus());
        dto.setTimestamp(transaction.getTimestamp());
        return dto;


}

}
