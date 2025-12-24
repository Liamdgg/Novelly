package com.novelly.backend.service;

import com.novelly.backend.entity.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User create(User user);
    Optional<User> findById(Integer id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findAll();
    void delete(Integer id);
}