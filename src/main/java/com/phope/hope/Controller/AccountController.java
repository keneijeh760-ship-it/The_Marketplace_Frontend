package com.phope.hope.Controller;

import com.phope.hope.Entity.Account;
import com.phope.hope.Repository.AccountRepository;
import com.phope.hope.Service.AccountService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/{id}")
    public Account getAccount(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }
    @PostMapping()
    public Account createAccount(Account account) {
        return accountService.createAccount(account);
    }
    @PatchMapping()
    public Account updateAccount(Account account) {
        return accountService.updateAccount(account);
    }

    @DeleteMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public void DeleteAccountById(Long Id){
        accountService.deleteAccount(Id);
    }




}
