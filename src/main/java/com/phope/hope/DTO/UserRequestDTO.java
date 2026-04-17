package com.phope.hope.DTO;

import java.util.List;

public class UserRequestDTO {
    private String name;
    private List<AccountRequestDTO> accounts;

    public UserRequestDTO(){

    }


    public String getName(){
        return name;
    }

    public List<AccountRequestDTO> getAccount(){
        return accounts;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setAccounts(List<AccountRequestDTO> accounts) {
        this.accounts = accounts;
    }
}
