package com.phope.hope.DTO;

public class AddToCartRequestDTO {
    private long productId;
    private int quantity;

    public AddToCartRequestDTO() {}

    public long getProductId() {
        return productId;
    }

    public void setProductId(long productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}