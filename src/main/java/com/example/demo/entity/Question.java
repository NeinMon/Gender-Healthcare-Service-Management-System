package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long questionID;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Date createdAt;
    private String category;

    @ManyToOne
    @JoinColumn(name = "customerID")
    private User customer;

    // ...getter, setter...
}
