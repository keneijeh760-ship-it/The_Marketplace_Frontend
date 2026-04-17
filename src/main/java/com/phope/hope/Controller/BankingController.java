package com.phope.hope.Controller;

import com.phope.hope.DTO.TransferRequest;
import com.phope.hope.Service.BankingService;
import org.springframework.web.bind.annotation.*;

@RestController
public class BankingController {

    private final BankingService bankingService;

    public BankingController( BankingService bankingService){
        this.bankingService = bankingService;
    }

    @PostMapping("/transfers")
    public String transferMoney(@RequestBody TransferRequest request) {
        bankingService.transferMoneyByAccountNumber(
                request.getFromAccountNumber(),
                request.getToAccountNumber(),
                request.getAmount()
        );
        return "Transfer successful";
    }
}
