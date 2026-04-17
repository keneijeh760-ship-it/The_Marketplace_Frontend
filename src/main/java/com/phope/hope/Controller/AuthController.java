package com.phope.hope.Controller;

import com.phope.hope.DTO.LoginRequestDTO;
import com.phope.hope.DTO.LoginResponseDTO;
import com.phope.hope.DTO.RegisterRequestDTO;
import com.phope.hope.Entity.Account;
import com.phope.hope.Entity.Role;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.AccountRepository;
import com.phope.hope.Repository.UserRepository;
import com.phope.hope.Security.JwtService;
import com.phope.hope.Service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserService userService,
                          AccountRepository accountRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        try {
            // Create user
            User user = userService.registerUser(
                    request.getName(),
                    request.getEmail(),
                    request.getPassword()
            );


            Account account = new Account(
                    request.getAccountNumber(),
                    request.getInitialBalance(),
                    request.getBankName(),
                    user
            );
            accountRepository.save(account);

            String token = jwtService.generateToken(user.getEmail());

            return ResponseEntity.ok(new LoginResponseDTO(token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserInfo(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String email = authentication.getName();

        User user = userService.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name()
        ));
    }
    @PostMapping("/create-first-admin")
    public ResponseEntity<?> createFirstAdmin(@RequestBody RegisterRequestDTO request) {
        try {
            User user = new User(
                    request.getName(),
                    request.getEmail(),
                    passwordEncoder.encode(request.getPassword()),
                    Role.ADMIN
            );

            userRepository.save(user);

            Account account = new Account(
                    request.getAccountNumber(),
                    request.getInitialBalance(),
                    request.getBankName(),
                    user
            );
            accountRepository.save(account);

            String token = jwtService.generateToken(user.getEmail());

            return ResponseEntity.ok(new LoginResponseDTO(token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Admin creation failed: " + e.getMessage());
        }
    }



    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());

            if (!matches) {
                return ResponseEntity.status(401).body("Invalid credentials - password does not match");
            }

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword())
            );

            String token = jwtService.generateToken(request.getEmail());

            return ResponseEntity.ok(new LoginResponseDTO(token));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }


    }


