package com.phope.hope.exception;

public class InsufficinetFundsException extends RuntimeException{
    public InsufficinetFundsException(String s) {
        super("Insufficient Funds");
    }
}
