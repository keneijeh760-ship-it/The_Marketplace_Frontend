package com.phope.hope.exception;

public class AccountNotFoundException extends RuntimeException{
    public AccountNotFoundException(String id) {
        super("Account Not Found with ID: " + id);
    }
}
