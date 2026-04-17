package com.phope.hope.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phope.hope.DTO.TransferRequest;
import com.phope.hope.Entity.Account;
import com.phope.hope.Entity.Status;
import com.phope.hope.Entity.Transaction;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.UserRepository;
import com.phope.hope.Service.BankingService;
import com.phope.hope.Service.TransactionService;
import com.phope.hope.Service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "testuser", roles = {"USER"})
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BankingService bankingService;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private UserRepository userRepository;

    @Test
    public void testTransferMoneySuccess() throws Exception {
        // Arrange
        TransferRequest request = new TransferRequest();
        request.setFromAccountNumber(1L);
        request.setToAccountNumber(2L);
        request.setAmount(100.0);

        // ✅ FIXED: Changed from TransferMoney to transferMoneyByAccountNumber
        doNothing().when(bankingService)
                .transferMoneyByAccountNumber(request.getFromAccountNumber(), request.getToAccountNumber(), request.getAmount());

        // Act & Assert
        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Transfer successful"));

        // ✅ FIXED: Changed from TransferMoney to transferMoneyByAccountNumber
        // Verify service call
        verify(bankingService, times(1))
                .transferMoneyByAccountNumber(1L, 2L, new BigDecimal(100.0));
    }

    @Test
    void testGetMyTransactions() throws Exception {
        // Arrange: create mock user and accounts
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("testuser@example.com");
        mockUser.setName("Test User");

        Account account1 = new Account();
        account1.setId(1L);
        account1.setAccountNumber(1234L);
        account1.setBalance(1000.0);
        account1.setUser(mockUser);

        Account account2 = new Account();
        account2.setId(2L);
        account2.setAccountNumber(5678L);
        account2.setBalance(500.0);
        account2.setUser(mockUser);

        mockUser.setAccounts(List.of(account1, account2));

        // Mock the UserRepository to return our mock user
        when(userRepository.findByEmail("testuser")).thenReturn(Optional.of(mockUser));

        // Create mock transactions
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

        List<Long> accountIds = List.of(1L, 2L);

        // Mock service to return transactions
        when(transactionService.findTransactionsByAccount(accountIds))
                .thenReturn(List.of(t1, t2));

        // Act & Assert
        mockMvc.perform(get("/api/transactions/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].fromAccountNumber").value(1234))
                .andExpect(jsonPath("$[0].toAccountNumber").value(5678))
                .andExpect(jsonPath("$[0].amount").value(200.0))
                .andExpect(jsonPath("$[0].status").value("SUCCESS"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].fromAccountNumber").value(5678))
                .andExpect(jsonPath("$[1].toAccountNumber").value(1234))
                .andExpect(jsonPath("$[1].amount").value(50.0))
                .andExpect(jsonPath("$[1].status").value("SUCCESS"));

        // Verify service call
        verify(transactionService, times(1))
                .findTransactionsByAccount(accountIds);
    }
}