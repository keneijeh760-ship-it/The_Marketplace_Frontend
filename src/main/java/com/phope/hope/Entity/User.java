package com.phope.hope.Entity;

import jakarta.persistence.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Account> accounts = new ArrayList<>();

    public User() {}

    public User (String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getName(){
        return name;
    }
    public long getId() {
        return id;
    }
    public String getEmail() {return email;}
    public String getPassword() {return password;}
    public Role getRole() {return role;}

    public List<Account> getAccounts() {
        return accounts;
    }

    public void setName(String name){
        this.name = name;
    }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(Role role) { this.role = role; }
    public void setId (long id) { this.id = id; }

    public void setAccounts(List<Account> accounts){
        this.accounts = accounts;

        if (accounts != null){
            for (Account account: accounts){
                account.setUser(this);
            }
        }
    }

    public void addAccount(Account account) {
        accounts.add(account);
        account.setUser(this);
    }
}