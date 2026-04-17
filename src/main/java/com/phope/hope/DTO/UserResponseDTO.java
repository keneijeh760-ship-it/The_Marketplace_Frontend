package com.phope.hope.DTO;

import java.util.List;

public class UserResponseDTO {
    private long id;
    private String name;
    private List<AccountResponseDTO> accounts;


    public UserResponseDTO(){

    }

    public long getId(){
        return  id;
    }

    public String getName(){
        return name;
    }

    public List<AccountResponseDTO> getAccounts(){
        return  accounts;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setAccounts(List<AccountResponseDTO> accounts){
        this.accounts = accounts;
    }
    public void setId(long id) {
        this.id = id;
    }

}
