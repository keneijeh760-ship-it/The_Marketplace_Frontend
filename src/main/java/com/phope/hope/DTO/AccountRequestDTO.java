package com.phope.hope.DTO;

import java.math.BigDecimal;

public class AccountRequestDTO {

    private long accountNumber;
    private BigDecimal balance;

    public AccountRequestDTO(){}

    public long getAccountNumber(){
        return accountNumber;
    }

    public BigDecimal getBalance(){
        return balance;
    }

    public void setAccountNumber(long accountNumber){
        this.accountNumber = accountNumber;
    }

    public void setBalance(BigDecimal balance){
        this.balance = balance;
    }
}
