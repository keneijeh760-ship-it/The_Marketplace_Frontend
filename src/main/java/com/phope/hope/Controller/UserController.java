package com.phope.hope.Controller;

import com.phope.hope.DTO.UserRequestDTO;
import com.phope.hope.DTO.UserResponseDTO;
import com.phope.hope.Entity.User;
import com.phope.hope.Service.BankingService;
import com.phope.hope.Service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {

    private final UserService userService;
    private final BankingService bankingService;

    public UserController(UserService userService, BankingService bankingService){
        this.userService = userService;
        this.bankingService = bankingService;
    }
    @GetMapping("/users")
    public List<User> getUser() {
        return userService.findUser();
    }

    @PostMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public UserResponseDTO createUser(@RequestBody UserRequestDTO requestDTO) {
        return bankingService.createUser(requestDTO);
    }

    @GetMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String email = authentication.getName();

        User user = userService.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(user);
    }

}
