package com.phope.hope.DTO;

import java.math.BigDecimal;

public class RegisterRequestDTO {
    private String name;
    private String email;
    private String password;
    private long accountNumber;      // ✅ NEW
    private String bankName;         // ✅ NEW
    private BigDecimal initialBalance;   // ✅ NEW

    public RegisterRequestDTO() {}

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public long getAccountNumber() { return accountNumber; }
    public String getBankName() { return bankName; }
    public BigDecimal getInitialBalance() { return initialBalance; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setAccountNumber(long accountNumber) { this.accountNumber = accountNumber; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public void setInitialBalance(BigDecimal initialBalance) { this.initialBalance = initialBalance; }
}