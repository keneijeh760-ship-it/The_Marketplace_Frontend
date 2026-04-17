package com.phope.hope.Service;

import com.phope.hope.Entity.Account;
import com.phope.hope.Repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    // Get all accounts
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // Get account by ID
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    // Create a new account for a user
    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }

    // Update account balance (used internally by BankingService)
    public Account updateAccount(Account account) {
        return accountRepository.save(account);
    }

    // Optional: delete an account
    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }
}
