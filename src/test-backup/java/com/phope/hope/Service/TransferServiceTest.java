package com.phope.hope.Service;

import com.phope.hope.Entity.Account;
import com.phope.hope.Entity.Status;
import com.phope.hope.Entity.Transaction;
import com.phope.hope.Repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    private TransactionRepository transactionRepository;
    private TransactionService transactionService;

    @BeforeEach
    void setUp() {
        transactionRepository = Mockito.mock(TransactionRepository.class);
        transactionService = new TransactionService(transactionRepository);
    }

    @Test
    void testFindAllTransactions() {
        // Arrange: mock some transactions
        Account from = new Account(1001L, 1000.0, "Chase Bank", null);
        Account to = new Account(2L, 500.0,"Chosen Bank", null);

        Transaction t1 = new Transaction();
        t1.setId(1L);
        t1.setFrom(from);
        t1.setTo(to);
        t1.setAmount(200.0);
        t1.setStatus(Status.SUCCESS);
        t1.setTimestamp(LocalDateTime.now());

        Transaction t2 = new Transaction();
        t2.setId(2L);
        t2.setFrom(to);
        t2.setTo(from);
        t2.setAmount(50.0);
        t2.setStatus(Status.SUCCESS);
        t2.setTimestamp(LocalDateTime.now());

        when(transactionRepository.findAll()).thenReturn(List.of(t1, t2));

        // Act
        List<Transaction> result = transactionService.findAllTransactions();

        // Assert
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals(2L, result.get(1).getId());

        // Verify repository method was called
        verify(transactionRepository, times(1)).findAll();
    }

    @Test
    void testFindTransactionsByAccount() {
        // Arrange: mock transactions for multiple accounts
        Account account1 = new Account(1234L, 1000.0,"Chosen Bank", null);
        Account account2 = new Account(5678L, 500.0,"Chosen Bank", null);

        Transaction t1 = new Transaction();
        t1.setId(1L);
        t1.setFrom(account1);
        t1.setTo(account2);
        t1.setAmount(200.0);
        t1.setStatus(Status.SUCCESS);
        t1.setTimestamp(LocalDateTime.now());

        Transaction t2 = new Transaction();
        t2.setId(2L);
        t2.setFrom(account2);
        t2.setTo(account1);
        t2.setAmount(50.0);
        t2.setStatus(Status.SUCCESS);
        t2.setTimestamp(LocalDateTime.now());

        List<Long> accountIds = List.of(1234L, 5678L);

        when(transactionRepository.findByFromIdInOrToIdIn(accountIds, accountIds))
                .thenReturn(List.of(t1, t2));

        // Act
        List<Transaction> result = transactionService.findTransactionsByAccount(accountIds);

        // Assert
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals(2L, result.get(1).getId());

        // Verify repository method was called
        verify(transactionRepository, times(1))
                .findByFromIdInOrToIdIn(accountIds, accountIds);
    }
}
