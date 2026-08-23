package com.spendtracker.dto.expense;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.spendtracker.model.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {

    @NotNull(
            message = "Amount is required"
    )
    @DecimalMin(
            value = "0.01",
            message = "Amount must be greater than zero"
    )
    private BigDecimal amount;

    @NotNull(
            message = "Category is required"
    )
    private ExpenseCategory category;

    @Size(
            max = 150,
            message = "Merchant must not exceed 150 characters"
    )
    private String merchant;

    @Size(
            max = 255,
            message = "Description must not exceed 255 characters"
    )
    private String description;

    @NotNull(
            message = "Expense date is required"
    )
    private LocalDate expenseDate;

    @Size(
            max = 100,
            message = "Payment method must not exceed 100 characters"
    )
    private String paymentMethod;

    @Size(
            max = 1000,
            message = "Notes must not exceed 1000 characters"
    )
    private String notes;

    public ExpenseRequest() {
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(
            BigDecimal amount
    ) {
        this.amount = amount;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(
            ExpenseCategory category
    ) {
        this.category = category;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(
            String merchant
    ) {
        this.merchant = merchant;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(
            LocalDate expenseDate
    ) {
        this.expenseDate = expenseDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(
            String paymentMethod
    ) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }

    /*
     * SECURITY:
     *
     * Reject every JSON field that is not explicitly
     * declared above.
     *
     * Examples that will be rejected:
     *
     * user
     * userId
     * id
     * createdAt
     * role
     */
    @JsonAnySetter
    public void rejectUnknownField(
            String fieldName,
            Object value
    ) {

        throw new IllegalArgumentException(
                "Unknown field: " + fieldName
        );
    }
}