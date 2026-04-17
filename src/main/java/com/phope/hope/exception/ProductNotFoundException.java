package com.phope.hope.exception;

public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(String id) {
        super("Product Not Found with ID: " + id);
    }
}