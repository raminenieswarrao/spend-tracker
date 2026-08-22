package com.spendtracker.controller;

import com.spendtracker.model.Expense;
import com.spendtracker.model.ExpenseCategory;
import com.spendtracker.repository.ExpenseRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;

    public ExpenseController(
            ExpenseRepository expenseRepository) {

        this.expenseRepository = expenseRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Expense createExpense(
            @Valid @RequestBody Expense expense) {

        expense.setId(null);

        return expenseRepository.save(expense);
    }

    @GetMapping
    public List<Expense> getExpenses(
            @RequestParam(required = false)
            Integer year,

            @RequestParam(required = false)
            Integer month) {

        if (year == null && month == null) {
            return expenseRepository
                    .findAllByOrderByExpenseDateDescIdDesc();
        }

        if (year == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Year is required when month is provided"
            );
        }

        try {

            LocalDate startDate;
            LocalDate endDate;

            if (month != null) {

                YearMonth yearMonth =
                        YearMonth.of(year, month);

                startDate =
                        yearMonth.atDay(1);

                endDate =
                        yearMonth.atEndOfMonth();

            } else {

                startDate =
                        LocalDate.of(year, 1, 1);

                endDate =
                        LocalDate.of(year, 12, 31);
            }

            return expenseRepository
                    .findByExpenseDateBetweenOrderByExpenseDateDescIdDesc(
                            startDate,
                            endDate
                    );

        } catch (DateTimeException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid year or month"
            );
        }
    }

    @PutMapping("/{id}")
    public Expense updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody Expense request) {

        Expense existing =
                expenseRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Expense not found"
                                        )
                        );

        existing.setAmount(
                request.getAmount()
        );

        existing.setCategory(
                request.getCategory()
        );

        existing.setMerchant(
                request.getMerchant()
        );

        existing.setDescription(
                request.getDescription()
        );

        existing.setExpenseDate(
                request.getExpenseDate()
        );

        existing.setPaymentMethod(
                request.getPaymentMethod()
        );

        existing.setNotes(
                request.getNotes()
        );

        return expenseRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(
            @PathVariable Long id) {

        if (!expenseRepository.existsById(id)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Expense not found"
            );
        }

        expenseRepository.deleteById(id);
    }

    @GetMapping("/categories")
    public List<ExpenseCategory> getCategories() {

        return Arrays.asList(
                ExpenseCategory.values()
        );
    }
}