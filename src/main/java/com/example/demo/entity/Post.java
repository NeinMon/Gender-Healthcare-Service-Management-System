package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postID;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String content;
    private Date createdAt;

    @ManyToOne
    @JoinColumn(name = "adminID")
    private User admin;

    // ...getter, setter...
}
