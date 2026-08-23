package com.spendtracker.repository;

import com.spendtracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository
        extends JpaRepository<Expense, Long> {

    /*
     * Return only expenses belonging to the authenticated user.
     */
    List<Expense>
    findAllByUser_IdOrderByExpenseDateDescIdDesc(
            Long userId
    );

    /*
     * Return only the authenticated user's expenses
     * within the requested date range.
     */
    List<Expense>
    findByUser_IdAndExpenseDateBetweenOrderByExpenseDateDescIdDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    /*
     * Used for secure update/delete operations.
     *
     * An expense is returned only when BOTH:
     *
     * expense.id = requested ID
     * AND
     * expense.user.id = authenticated user ID
     */
    Optional<Expense> findByIdAndUser_Id(
            Long expenseId,
            Long userId
    );
}