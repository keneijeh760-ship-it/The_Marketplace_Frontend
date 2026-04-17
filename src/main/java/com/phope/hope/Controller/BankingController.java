package com.phope.hope.Controller;

import com.phope.hope.DTO.AccountResponseDTO;
import com.phope.hope.DTO.TransferRequest;
import com.phope.hope.DTO.UserRequestDTO;
import com.phope.hope.DTO.UserResponseDTO;
import com.phope.hope.Entity.Account;
import com.phope.hope.Entity.User;
import com.phope.hope.Service.BankingService;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController

public class BankingController {


    private final BankingService bankingService;



    public BankingController( BankingService bankingService){

        this.bankingService = bankingService;

    }




    @PostMapping("/transfers")
    public String transferMoney(@RequestBody TransferRequest request) {
        bankingService.TransferMoney(
                request.getFromAccountNumber(),
                request.getToAccountNumber(),
                request.getAmount()
        );
        return "Transfer successful";
    }


}
