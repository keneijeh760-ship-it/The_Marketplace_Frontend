package com.phope.hope.Repository;

import com.phope.hope.Entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFromIdInOrToIdIn(List<Long> fromId, List<Long> toId);

}
