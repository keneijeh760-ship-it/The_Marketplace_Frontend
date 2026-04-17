package com.phope.hope.DTO;

import java.math.BigDecimal;
import java.util.List;

public class AccountResponseDTO {
    private long accountNumber;
    private BigDecimal balance;


    public AccountResponseDTO(){}

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
