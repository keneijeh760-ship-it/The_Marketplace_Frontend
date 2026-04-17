package com.phope.hope.Controller;

import com.phope.hope.DTO.TransactionResponseDTO;
import com.phope.hope.DTO.TransferRequest;
import com.phope.hope.Entity.Transaction;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.UserRepository;
import com.phope.hope.Service.BankingService;
import com.phope.hope.Service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final BankingService bankingService;
    private final TransactionService transactionService;
    private final UserRepository userRepository;

    @Autowired
    public TransactionController(TransactionService transactionService,
                                 BankingService bankingService,
                                 UserRepository userRepository) {
        this.transactionService = transactionService;
        this.bankingService = bankingService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<TransactionResponseDTO> findAll() {
        return transactionService.findAllTransactions()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public List<TransactionResponseDTO> getMyTransactions(Authentication authentication) {
        try {
            System.out.println(" Getting transactions for: " + authentication.getName());

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println(" User found: " + user.getEmail());

            if (user.getAccounts() == null || user.getAccounts().isEmpty()) {
                System.out.println("⚠ User has no accounts");
                return List.of(); // Return empty list instead of crashing
            }

            List<Long> accountIds = user.getAccounts()
                    .stream()
                    .map(account -> account.getId())
                    .toList();

            System.out.println(" Account IDs: " + accountIds);

            List<Transaction> transactions = transactionService.findTransactionsByAccount(accountIds);

            System.out.println(" Found " + transactions.size() + " transactions");

            return transactions.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println(" Error getting transactions: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // ✅ UPDATED: Now accepts account numbers instead of account IDs
    @PostMapping("/transfer")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<String> transferMoney(@RequestBody TransferRequest request) {
        bankingService.transferMoneyByAccountNumber(
                request.getFromAccountNumber(),
                request.getToAccountNumber(),
                request.getAmount()
        );
        return ResponseEntity.ok("Transfer successful");
    }

    private TransactionResponseDTO mapToDTO(Transaction transaction) {
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