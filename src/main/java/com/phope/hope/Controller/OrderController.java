package com.phope.hope.Controller;

import com.phope.hope.DTO.CheckoutRequestDTO;
import com.phope.hope.DTO.OrderResponseDTO;
import com.phope.hope.Entity.OrderStatus;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.UserRepository;
import com.phope.hope.Service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponseDTO> checkout(
            @RequestBody CheckoutRequestDTO request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        OrderResponseDTO order = orderService.createOrder(
                user,
                request.getShippingAddress(),
                request.getBillingAddress(),
                request.getPaymentMethod()
        );
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<OrderResponseDTO> orders = orderService.getUserOrders(user);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponseDTO> getOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        OrderResponseDTO order = orderService.getOrderById(user, orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        List<OrderResponseDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        OrderStatus status = OrderStatus.valueOf(request.get("status"));
        OrderResponseDTO order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }
    @PostMapping("/{orderId}/release-escrow")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<OrderResponseDTO> releaseEscrow(@PathVariable Long orderId) {
        OrderResponseDTO order = orderService.releaseEscrow(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/refund")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<OrderResponseDTO> refundOrder(@PathVariable Long orderId) {
        OrderResponseDTO order = orderService.refundOrder(orderId);
        return ResponseEntity.ok(order);
    }


    private User getUserFromAuth(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


}