package com.phope.hope.Service;

import com.phope.hope.DTO.AccountResponseDTO;
import com.phope.hope.DTO.UserRequestDTO;
import com.phope.hope.DTO.UserResponseDTO;
import com.phope.hope.Entity.Account;
import com.phope.hope.Entity.Status;
import com.phope.hope.Entity.Transaction;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.AccountRepository;
import com.phope.hope.Repository.TransactionRepository;
import com.phope.hope.Repository.UserRepository;
import com.phope.hope.exception.AccountNotFoundException;
import com.phope.hope.exception.InsufficinetFundsException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class BankingService {
    private static final Logger logger = LoggerFactory.getLogger(BankingService.class);

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public BankingService(AccountRepository accountRepository, UserRepository userRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public UserResponseDTO mapToUserResponse(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setAccounts(user.getAccounts().stream()
                .map(this::mapToAccountResponse)
                .collect(Collectors.toList()));
        return dto;
    }

    public AccountResponseDTO mapToAccountResponse(Account account) {
        AccountResponseDTO dto = new AccountResponseDTO();
        dto.setAccountNumber(account.getAccountNumber());
        dto.setBalance(account.getBalance());
        return dto;
    }

    public User mapToUserEntity(UserRequestDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        if (dto.getAccount() != null) {
            dto.getAccount().forEach(a -> {
                Account account = new Account();
                account.setAccountNumber(a.getAccountNumber());
                account.setBalance(a.getBalance());
                user.addAccount(account);
            });
        }
        return user;
    }

    public UserResponseDTO createUser(UserRequestDTO dto) {
        User userEntity = mapToUserEntity(dto);
        User savedUser = userRepository.save(userEntity);
        return mapToUserResponse(savedUser);
    }

    // ✅ OLD METHOD: Transfer by account ID (keep for backward compatibility)
    @Transactional
    public void TransferMoney(Long fromAccountId, Long toAccountId, BigDecimal amount) {
        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + fromAccountId));

        Account toAccount = accountRepository.findById(toAccountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + toAccountId));

        transferBetweenAccounts(fromAccount, toAccount, amount);
    }

    // ✅ NEW METHOD: Transfer by account number
    @Transactional
    public void transferMoneyByAccountNumber(long fromAccountNumber, long toAccountNumber, BigDecimal amount) {
        Account fromAccount = accountRepository.findByAccountNumber(fromAccountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + fromAccountNumber));

        Account toAccount = accountRepository.findByAccountNumber(toAccountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + toAccountNumber));

        transferBetweenAccounts(fromAccount, toAccount, amount);
    }

    
    private void transferBetweenAccounts(Account fromAccount, Account toAccount, BigDecimal amount ) {
        // Check funds
        if (fromAccount.getBalance().compareTo(amount) < 0) {
            logger.warn("Transfer failed: insufficient funds in account {}", fromAccount.getAccountNumber());
            throw new InsufficinetFundsException("Insufficient funds");
        }

        // Update balances

        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        toAccount.setBalance(toAccount.getBalance().add(amount));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        // Save transaction
        Transaction transaction = new Transaction();
        transaction.setFrom(fromAccount);
        transaction.setTo(toAccount);
        transaction.setAmount(amount);
        transaction.setStatus(Status.SUCCESS);
        transaction.setTimestamp(LocalDateTime.now());

        transactionRepository.save(transaction);

        logger.info("Transfer successful: {} -> {} amount {}",
                fromAccount.getAccountNumber(), toAccount.getAccountNumber(), amount);
    }
}