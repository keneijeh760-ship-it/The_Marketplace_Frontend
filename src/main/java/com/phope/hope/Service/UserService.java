package com.phope.hope.Service;

import com.phope.hope.Entity.Role;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findUser(){
        return userRepository.findAll();
    }

    public User createUser(User user){
        return userRepository.save(user);
    }

    public User registerUser(String name, String email, String password) {
        // Hash the password
        String hashedPassword = passwordEncoder.encode(password);

        // Create user with default role
        User user = new User(name, email, hashedPassword, Role.USER);

        return userRepository.save(user);
    }

    public Optional<User> findUserByEmail(String email){
        return userRepository.findByEmail(email);
    }
}