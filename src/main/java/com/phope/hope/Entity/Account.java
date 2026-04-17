package com.phope.hope.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "account")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long accountNumber;
    @Column(precision = 19, scale = 2)
    private BigDecimal balance;
    private String bankName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Version
    private Long version;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Account () {}

    public Account (long accountNumber,BigDecimal balance, String bankName, User user){
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.bankName = bankName;
        this.user = user;
    }

    public BigDecimal getBalance (){
        return balance;
    }

    public long getAccountNumber(){
        return accountNumber;
    }

    public long getId() {
        return id;
    }

    @JsonIgnore
    public User getUser() {
        return user;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBalance(BigDecimal balance){
        this.balance = balance;
    }

    public void setAccountNumber(long accountNumber) {
        this.accountNumber = accountNumber;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public Long getVersion() {
        return version;
    }
}