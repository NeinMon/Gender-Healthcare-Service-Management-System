package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "questionID")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "consultantID")
    private User consultant;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Date createdAt;

    // ...getter, setter...
}
