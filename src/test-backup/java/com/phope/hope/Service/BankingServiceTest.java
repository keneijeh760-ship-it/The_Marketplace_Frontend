package com.phope.hope.Service;

import com.phope.hope.DTO.AccountResponseDTO;
import com.phope.hope.DTO.UserRequestDTO;
import com.phope.hope.DTO.UserResponseDTO;
import com.phope.hope.Entity.Account;
import com.phope.hope.Entity.Transaction;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.AccountRepository;
import com.phope.hope.Repository.TransactionRepository;
import com.phope.hope.Repository.UserRepository;
import com.phope.hope.Service.BankingService;
import com.phope.hope.exception.AccountNotFoundException;
import com.phope.hope.exception.InsufficinetFundsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BankingServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private BankingService bankingService;

    @Test
    void testCreateUser() {
        UserRequestDTO requestDTO = new UserRequestDTO();
        requestDTO.setName("Alice");

        AccountResponseDTO accountDTO = new AccountResponseDTO();
        accountDTO.setAccountNumber(123);
        accountDTO.setBalance(1000);

        requestDTO.setAccounts(Collections.singletonList(
                new com.phope.hope.DTO.AccountRequestDTO(){{
                    setAccountNumber(123);
                    setBalance(1000);
                }}
        ));

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("Alice");
        // ✅ FIXED: Added bankName parameter
        Account account = new Account(123, 1000, "Chosen Bank", savedUser);
        savedUser.addAccount(account);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponseDTO response = bankingService.createUser(requestDTO);

        assertEquals(1L, response.getId());
        assertEquals("Alice", response.getName());
        assertEquals(1, response.getAccounts().size());
        assertEquals(123, response.getAccounts().get(0).getAccountNumber());
    }

    @Test
    void testTransferMoneySuccess() {
        // ✅ FIXED: Added bankName parameter
        Account from = new Account(1001L, 1000.0, "Chase Bank", null);
        from.setId(1L);

        Account to = new Account(1002L, 500.0, "Bank of America", null);
        to.setId(2L);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(from));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(to));
        when(accountRepository.save(any(Account.class))).thenAnswer(i -> i.getArguments()[0]);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArguments()[0]);

        bankingService.TransferMoney(1L, 2L, 200);

        assertEquals(800, from.getBalance());
        assertEquals(700, to.getBalance());

        // Verify that transaction was saved
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void testTransferMoneyInsufficientFunds() {
        // ✅ FIXED: Added bankName parameter
        Account from = new Account(1001L, 100.0, "Chase Bank", null);
        from.setId(1L);

        Account to = new Account(1002L, 500.0, "Bank of America", null);
        to.setId(2L);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(from));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(to));

        assertThrows(InsufficinetFundsException.class, () ->
                bankingService.TransferMoney(1L, 2L, 200)
        );

        // Verify no transaction was saved
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testTransferMoneyAccountNotFound() {
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () ->
                bankingService.TransferMoney(1L, 2L, 100)
        );

        // Verify no transaction was saved
        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}