package com.spendtracker.controller;

import com.spendtracker.dto.expense.ExpenseRequest;
import com.spendtracker.dto.expense.ExpenseResponse;
import com.spendtracker.model.Expense;
import com.spendtracker.model.ExpenseCategory;
import com.spendtracker.model.User;
import com.spendtracker.repository.ExpenseRepository;
import com.spendtracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
    private final UserRepository userRepository;

    public ExpenseController(
            ExpenseRepository expenseRepository,
            UserRepository userRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse createExpense(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ExpenseRequest request
    ) {

        Long userId =
                getAuthenticatedUserId(jwt);

        User user =
                getAuthenticatedUser(userId);

        Expense expense =
                new Expense();

        /*
         * SECURITY:
         *
         * Expense ownership always comes from the
         * authenticated JWT.
         *
         * The frontend cannot select another user.
         */
        expense.setUser(user);

        applyRequest(
                expense,
                request
        );

        Expense savedExpense =
                expenseRepository.save(expense);

        return toResponse(savedExpense);
    }

    @GetMapping
    public List<ExpenseResponse> getExpenses(
            @AuthenticationPrincipal Jwt jwt,

            @RequestParam(required = false)
            Integer year,

            @RequestParam(required = false)
            Integer month
    ) {

        Long userId =
                getAuthenticatedUserId(jwt);

        getAuthenticatedUser(userId);

        List<Expense> expenses;

        if (year == null && month == null) {

            expenses =
                    expenseRepository
                            .findAllByUser_IdOrderByExpenseDateDescIdDesc(
                                    userId
                            );

            return expenses
                    .stream()
                    .map(this::toResponse)
                    .toList();
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
                        YearMonth.of(
                                year,
                                month
                        );

                startDate =
                        yearMonth.atDay(1);

                endDate =
                        yearMonth.atEndOfMonth();

            } else {

                startDate =
                        LocalDate.of(
                                year,
                                1,
                                1
                        );

                endDate =
                        LocalDate.of(
                                year,
                                12,
                                31
                        );
            }

            expenses =
                    expenseRepository
                            .findByUser_IdAndExpenseDateBetweenOrderByExpenseDateDescIdDesc(
                                    userId,
                                    startDate,
                                    endDate
                            );

            return expenses
                    .stream()
                    .map(this::toResponse)
                    .toList();

        } catch (DateTimeException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid year or month"
            );
        }
    }

    @PutMapping("/{id}")
    public ExpenseResponse updateExpense(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request
    ) {

        Long userId =
                getAuthenticatedUserId(jwt);

        getAuthenticatedUser(userId);

        /*
         * SECURITY:
         *
         * Query by both:
         *
         * expense ID
         * authenticated user ID
         *
         * so one user cannot update another
         * user's expense.
         */
        Expense existing =
                expenseRepository
                        .findByIdAndUser_Id(
                                id,
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Expense not found"
                                        )
                        );

        applyRequest(
                existing,
                request
        );

        Expense savedExpense =
                expenseRepository.save(existing);

        return toResponse(savedExpense);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {

        Long userId =
                getAuthenticatedUserId(jwt);

        getAuthenticatedUser(userId);

        Expense expense =
                expenseRepository
                        .findByIdAndUser_Id(
                                id,
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Expense not found"
                                        )
                        );

        expenseRepository.delete(expense);
    }

    @GetMapping("/categories")
    public List<ExpenseCategory> getCategories() {

        return Arrays.asList(
                ExpenseCategory.values()
        );
    }

    private void applyRequest(
            Expense expense,
            ExpenseRequest request
    ) {

        expense.setAmount(
                request.getAmount()
        );

        expense.setCategory(
                request.getCategory()
        );

        expense.setMerchant(
                request.getMerchant()
        );

        expense.setDescription(
                request.getDescription()
        );

        expense.setExpenseDate(
                request.getExpenseDate()
        );

        expense.setPaymentMethod(
                request.getPaymentMethod()
        );

        expense.setNotes(
                request.getNotes()
        );
    }

    private ExpenseResponse toResponse(
            Expense expense
    ) {

        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getMerchant(),
                expense.getDescription(),
                expense.getExpenseDate(),
                expense.getPaymentMethod(),
                expense.getNotes(),
                expense.getCreatedAt()
        );
    }

    private Long getAuthenticatedUserId(
            Jwt jwt
    ) {

        if (jwt == null
                || jwt.getSubject() == null
                || jwt.getSubject().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        try {

            return Long.valueOf(
                    jwt.getSubject()
            );

        } catch (NumberFormatException exception) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid authentication"
            );
        }
    }

    private User getAuthenticatedUser(
            Long userId
    ) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Invalid authentication"
                                        )
                        );

        if (!user.isEnabled()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid authentication"
            );
        }

        return user;
    }
}