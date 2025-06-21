package com.genderhealthcare.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.genderhealthcare.demo.entity.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findByUserID(Integer userId);
}
