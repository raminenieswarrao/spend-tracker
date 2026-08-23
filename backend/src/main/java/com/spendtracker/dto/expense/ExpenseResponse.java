package com.spendtracker.dto.expense;

import com.spendtracker.model.ExpenseCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public class ExpenseResponse {

    private Long id;
    private BigDecimal amount;
    private ExpenseCategory category;
    private String merchant;
    private String description;
    private LocalDate expenseDate;
    private String paymentMethod;
    private String notes;
    private OffsetDateTime createdAt;

    public ExpenseResponse() {
    }

    public ExpenseResponse(
            Long id,
            BigDecimal amount,
            ExpenseCategory category,
            String merchant,
            String description,
            LocalDate expenseDate,
            String paymentMethod,
            String notes,
            OffsetDateTime createdAt
    ) {
        this.id = id;
        this.amount = amount;
        this.category = category;
        this.merchant = merchant;
        this.description = description;
        this.expenseDate = expenseDate;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public String getMerchant() {
        return merchant;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}