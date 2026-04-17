package com.phope.hope.exception;

public class EmptyCartException extends RuntimeException{
    public EmptyCartException() {
        super("Cart is Empty " );
    }

}
