package com.phope.hope.DTO;

import java.math.BigDecimal;

public class TransferRequest {

    private long fromAccountNumber;  // ✅ CHANGED: from ID to account number
    private long toAccountNumber;    // ✅ CHANGED: from ID to account number
    private BigDecimal amount;

    public TransferRequest(){}

    public long getFromAccountNumber() {
        return fromAccountNumber;
    }

    public void setFromAccountNumber(long fromAccountNumber) {
        this.fromAccountNumber = fromAccountNumber;
    }

    public long getToAccountNumber() {
        return toAccountNumber;
    }

    public void setToAccountNumber(long toAccountNumber) {
        this.toAccountNumber = toAccountNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}