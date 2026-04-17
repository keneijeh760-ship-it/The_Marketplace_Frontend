package com.phope.hope.Service;

import com.phope.hope.Entity.Account;
import com.phope.hope.Repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private Account account;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        account = new Account();
        account.setAccountNumber(123456);
        account.setBalance(1000.0);
    }

    @Test
    void testGetAllAccounts() {
        when(accountRepository.findAll()).thenReturn(List.of(account));

        List<Account> accounts = accountService.getAllAccounts();

        assertEquals(1, accounts.size());
        assertEquals(123456, accounts.get(0).getAccountNumber());
        verify(accountRepository, times(1)).findAll();
    }

    @Test
    void testGetAccountById() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        Account result = accountService.getAccountById(1L);

        assertEquals(123456, result.getAccountNumber());
        verify(accountRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateAccount() {
        when(accountRepository.save(account)).thenReturn(account);

        Account saved = accountService.createAccount(account);

        assertEquals(123456, saved.getAccountNumber());
        verify(accountRepository, times(1)).save(account);
    }

    @Test
    void testDeleteAccount() {
        doNothing().when(accountRepository).deleteById(1L);

        accountService.deleteAccount(1L);

        verify(accountRepository, times(1)).deleteById(1L);
    }
}
