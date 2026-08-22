package com.spendtracker.repository;

import com.spendtracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository
        extends JpaRepository<Expense, Long> {

    List<Expense> findAllByOrderByExpenseDateDescIdDesc();

    List<Expense>
    findByExpenseDateBetweenOrderByExpenseDateDescIdDesc(
            LocalDate startDate,
            LocalDate endDate
    );
}