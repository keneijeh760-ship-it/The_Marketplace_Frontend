package com.phope.hope.Controller;

import com.phope.hope.Entity.Account;
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
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @PostMapping()
    public Account createAccount(@RequestBody Account account) {
        return accountService.createAccount(account);
    }

    @PatchMapping("/{id}")
    public Account updateAccount(@PathVariable Long id, @RequestBody Account account) {
        account.setId(id);
        return accountService.updateAccount(account);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteAccountById(@PathVariable Long id){
        accountService.deleteAccount(id);
    }
}
