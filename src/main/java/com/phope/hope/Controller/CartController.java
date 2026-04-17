package com.phope.hope.Controller;

import com.phope.hope.DTO.AddToCartRequestDTO;
import com.phope.hope.DTO.CartItemResponseDTO;
import com.phope.hope.DTO.UpdateQuantityRequestDTO;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.UserRepository;
import com.phope.hope.Service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CartItemResponseDTO>> getCart(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<CartItemResponseDTO> cart = cartService.getUserCart(user);
        return ResponseEntity.ok(cart);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartItemResponseDTO> addToCart(
            @RequestBody AddToCartRequestDTO request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        CartItemResponseDTO cartItem = cartService.addToCart(user, request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(cartItem);
    }

    @PutMapping("/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartItemResponseDTO> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody UpdateQuantityRequestDTO request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        CartItemResponseDTO cartItem = cartService.updateQuantity(user, cartItemId, request.getQuantity());
        return ResponseEntity.ok(cartItem);
    }

    @DeleteMapping("/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        cartService.removeFromCart(user, cartItemId);
        return ResponseEntity.ok("Item removed from cart");
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> clearCart(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        cartService.clearCart(user);
        return ResponseEntity.ok("Cart cleared");
    }

    @GetMapping("/total")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, BigDecimal>> getCartTotal(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        BigDecimal total = cartService.getCartTotal(user);
        return ResponseEntity.ok(Map.of("total", total));
    }

    private User getUserFromAuth(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}