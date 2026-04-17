package com.phope.hope.DTO;

import java.math.BigDecimal;

public class ProductResponseDTO {
    private long id;
    private String name;
    private BigDecimal price;

    public ProductResponseDTO() {}

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}