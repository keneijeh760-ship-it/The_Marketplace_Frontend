package com.phope.hope.Service;

import com.phope.hope.Entity.Transaction;
import com.phope.hope.Repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // -----------------------------
    // Fetch all transactions (Admin-only)
    // -----------------------------
    public List<Transaction> findAllTransactions() {
        return transactionRepository.findAll();
    }

    // -----------------------------
    // Fetch all transactions for given account IDs (User)
    // -----------------------------
    public List<Transaction> findTransactionsByAccount(List<Long> accountIds) {
        // Make sure your repository method exists:
        // findByFromAccountIdInOrToAccountIdIn(List<Long> fromIds, List<Long> toIds)
        return transactionRepository.findByFromIdInOrToIdIn(accountIds, accountIds);
    }
}
