package edu.campus.lostfound;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ItemType type;

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @NotBlank
    private String location;

    @Column(length = 1500)
    private String description;

    @NotBlank
    private String contact;

    @NotNull
    private LocalDate dateReported = LocalDate.now();

    @NotNull
    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.OPEN;

    public Item() {}

    @PrePersist
    void setDefaults() {
        if (dateReported == null) dateReported = LocalDate.now();
        if (status == null) status = ItemStatus.OPEN;
    }

    public Long getId() { return id; }
    public ItemType getType() { return type; }
    public void setType(ItemType type) { this.type = type; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public LocalDate getDateReported() { return dateReported; }
    public void setDateReported(LocalDate dateReported) { this.dateReported = dateReported; }
    public ItemStatus getStatus() { return status; }
    public void setStatus(ItemStatus status) { this.status = status; }
}
