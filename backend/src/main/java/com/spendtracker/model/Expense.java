package com.spendtracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(
        name = "expenses",
        indexes = {
                @Index(
                        name = "idx_expenses_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_expenses_user_date",
                        columnList = "user_id, expense_date"
                )
        }
)
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Every expense MUST belong to exactly one user.
     *
     * Ownership is assigned by the backend from the
     * authenticated JWT, never from frontend input.
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_expenses_user"
            )
    )
    @JsonIgnore
    private User user;

    @NotNull(
            message = "Amount is required"
    )
    @DecimalMin(
            value = "0.01",
            message = "Amount must be greater than zero"
    )
    @Column(
            name = "amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal amount;

    @NotNull(
            message = "Category is required"
    )
    @Enumerated(EnumType.STRING)
    @Column(
            name = "category",
            nullable = false,
            length = 50
    )
    private ExpenseCategory category;

    @Column(
            name = "merchant",
            length = 150
    )
    private String merchant;

    @Column(
            name = "description",
            length = 255
    )
    private String description;

    @NotNull(
            message = "Expense date is required"
    )
    @Column(
            name = "expense_date",
            nullable = false
    )
    private LocalDate expenseDate;

    @Column(
            name = "payment_method",
            length = 100
    )
    private String paymentMethod;

    @Column(
            name = "notes",
            length = 1000
    )
    private String notes;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private OffsetDateTime createdAt;

    public Expense() {
    }

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt =
                    OffsetDateTime.now(
                            ZoneOffset.UTC
                    );
        }
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user
    ) {
        this.user = user;
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}