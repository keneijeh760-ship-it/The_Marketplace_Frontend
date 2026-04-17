package com.phope.hope.exception;

public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String id) {
        super("Order Not Found with ID: " + id);
    }
}