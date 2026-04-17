package com.phope.hope.Service;
import com.phope.hope.Service.NotificationService;
import com.phope.hope.DTO.OrderItemResponseDTO;
import com.phope.hope.DTO.OrderResponseDTO;
import com.phope.hope.DTO.ProductResponseDTO;
import com.phope.hope.Entity.*;
import com.phope.hope.Repository.AccountRepository;
import com.phope.hope.Repository.CartItemRepository;
import com.phope.hope.Repository.OrderRepository;
import com.phope.hope.Repository.TransactionRepository;
import com.phope.hope.exception.EmptyCartException;
import com.phope.hope.exception.InsufficinetFundsException;
import com.phope.hope.exception.OrderNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10% tax
    private final NotificationService notificationService;

    public OrderService(
            OrderRepository orderRepository,
            CartItemRepository cartItemRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            NotificationService notificationService
    ) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public OrderResponseDTO createOrder(User buyer, String shippingAddress, String billingAddress, String paymentMethod) {
        // STEP 1: Get cart items
        List<CartItem> cartItems = cartItemRepository.findByUser(buyer);

        if (cartItems.isEmpty()) {
            throw new EmptyCartException();
        }

        // STEP 2: Get seller from first cart item
        User seller = cartItems.get(0).getProduct().getSeller();

        // STEP 3: Calculate totals
        BigDecimal subtotal = cartItems.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = subtotal.multiply(TAX_RATE);
        BigDecimal total = subtotal.add(tax);  // Fixed: add, not multiply

        // STEP 4: Get buyer's account (assuming first account)
        if (buyer.getAccounts().isEmpty()) {
            throw new RuntimeException("Buyer has no account");
        }
        Account buyerAccount = buyer.getAccounts().get(0);

        // STEP 5: Validate sufficient funds
        if (buyerAccount.getBalance().compareTo(total) < 0) {
            throw new InsufficinetFundsException(
                    "Insufficient balance. Required: " + total +
                            ", Available: " + buyerAccount.getBalance()
            );
        }

        // STEP 6: Deduct money from buyer's account
        buyerAccount.setBalance(buyerAccount.getBalance().subtract(total));

        // STEP 7: Save updated account
        accountRepository.save(buyerAccount);

        // STEP 8: Create escrow transaction
        Transaction transaction = new Transaction();
        transaction.setFrom(buyerAccount);
        transaction.setTo(null);  // Escrow - not going to seller yet
        transaction.setAmount(total);
        transaction.setType(TransactionType.ORDER_PAYMENT);
        transaction.setStatus(Status.SUCCESS);
        transaction.setIdempotencyKey(UUID.randomUUID().toString());
        transaction.setTimestamp(LocalDateTime.now());

        // STEP 9: Save transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // STEP 10: Create order
        Order order = new Order(buyer, seller, subtotal, tax, total, OrderStatus.PENDING);
        order.setShippingAddress(shippingAddress);
        order.setBillingAddress(billingAddress);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(PaymentStatus.PAID);  // Payment successful, money in escrow
        order.setTransaction(savedTransaction);       // Link to payment transaction

        // STEP 11: Create order items from cart items
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem(
                    order,
                    cartItem.getProduct(),
                    cartItem.getQuantity(),
                    cartItem.getProduct().getPrice()
            );
            order.addOrderItem(orderItem);
        }

        // STEP 12: Save order
        Order savedOrder = orderRepository.save(order);

        // STEP 13: Clear cart
        cartItemRepository.deleteByUser(buyer);



        notificationService.notifyOrderUpdate(
                buyer.getId(),
                "Order placed successfully! Total: $ " + total,
                mapToOrderResponse(savedOrder)
        );

        notificationService.notifyNewOrder(
                seller.getId(),
                "New order received! Total: $" + total,
                mapToOrderResponse(savedOrder)
        );

        notificationService.notifyBalanceUpdate(
                buyer.getId(),
                "Payment processed: -$" + total,
                buyerAccount.getBalance()
        );

        return mapToOrderResponse(savedOrder);
    }

    public List<OrderResponseDTO> getUserOrders(User buyer) {
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(buyer);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO getOrderById(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(String.valueOf(orderId)));

        // Verify order belongs to user
        if (order.getUser().getId() != user.getId())  {
            throw new RuntimeException("Order does not belong to user");
        }

        return mapToOrderResponse(order);
    }

    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(String.valueOf(orderId)));

        order.setStatus(status);
        Order saved = orderRepository.save(order);

        return mapToOrderResponse(saved);
    }

    @Transactional
    public OrderResponseDTO releaseEscrow(long orderId){
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(String.valueOf(orderId)));

        if (order.isEscrowReleased()) {
            throw new RuntimeException("Order has already been released");
        }

        if (order.getPaymentStatus() != PaymentStatus.PAID){
            throw new RuntimeException("Order payment not completed");
        }

        User seller = order.getSeller();
        if (seller.getAccounts().isEmpty()) {
            throw new RuntimeException("Seller has no accounts");
        }

        Account sellerAccount = seller.getAccounts().get(0);

        BigDecimal total = order.getTotal();

        sellerAccount.setBalance(sellerAccount.getBalance().add(total));
        accountRepository.save(sellerAccount);
        Transaction releaseTransaction = new Transaction();
        releaseTransaction.setFrom(null);  // From escrow (conceptual)
        releaseTransaction.setTo(sellerAccount);
        releaseTransaction.setAmount(total);
        releaseTransaction.setType(TransactionType.ESCROW_RELEASE);
        releaseTransaction.setStatus(Status.SUCCESS);
        releaseTransaction.setIdempotencyKey(UUID.randomUUID().toString());
        releaseTransaction.setTimestamp(LocalDateTime.now());
        transactionRepository.save(releaseTransaction);

        order.setEscrowReleased(true);
        order.setPaymentStatus(PaymentStatus.RELEASED);
        order.setStatus(OrderStatus.DELIVERED);

        Order savedOrder = orderRepository.save(order);

        notificationService.notifyBalanceUpdate(
                seller.getId(),
                "Payment received: +$" + total,
                sellerAccount.getBalance()
        );

        notificationService.notifyOrderUpdate(
                order.getUser().getId(),
                "Your order has been delivered!",
                mapToOrderResponse(savedOrder)
        );

        return mapToOrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponseDTO refundOrder(Long orderId){
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(String.valueOf(orderId)));
        if (order.isEscrowReleased()) {
            throw new RuntimeException("Cannot refund - escrow already released to seller");
        }

        if (order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new RuntimeException("Cannot refund - order not paid or already refunded");
        }

        User buyer = order.getUser();
        if (buyer.getAccounts().isEmpty()) {
            throw new RuntimeException("Buyer has no account");
        }
        Account buyerAccount = buyer.getAccounts().get(0);

        BigDecimal refundAmount = order.getTotal();

        buyerAccount.setBalance(buyerAccount.getBalance().add(refundAmount));
        accountRepository.save(buyerAccount);

        Transaction refundTransaction = new Transaction();
        refundTransaction.setFrom(null);
        refundTransaction.setTo(buyerAccount);
        refundTransaction.setAmount(refundAmount);
        refundTransaction.setType(TransactionType.REFUND);
        refundTransaction.setStatus(Status.SUCCESS);
        refundTransaction.setIdempotencyKey(UUID.randomUUID().toString());
        refundTransaction.setTimestamp(LocalDateTime.now());
        transactionRepository.save(refundTransaction);

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);

        Order savedOrder = orderRepository.save(order);

        notificationService.notifyBalanceUpdate(
                buyer.getId(),
                "Refund processed: +$" + refundAmount,
                buyerAccount.getBalance()
        );

        notificationService.notifyOrderUpdate(
                buyer.getId(),
                "Your order has been refunded.",
                mapToOrderResponse(savedOrder)
        );

        return mapToOrderResponse(savedOrder);
    }

    private OrderResponseDTO mapToOrderResponse(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderItems(order.getOrderItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList()));
        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setBillingAddress(order.getBillingAddress());
        dto.setPaymentMethod(order.getPaymentMethod());
        return dto;
    }

    private OrderItemResponseDTO mapToOrderItemResponse(OrderItem orderItem) {
        OrderItemResponseDTO dto = new OrderItemResponseDTO();
        dto.setId(orderItem.getId());
        dto.setProduct(mapToProductResponse(orderItem.getProduct()));
        dto.setQuantity(orderItem.getQuantity());
        dto.setPriceAtPurchase(orderItem.getPriceAtPurchase());
        dto.setSubtotal(orderItem.getSubtotal());
        return dto;
    }

    private ProductResponseDTO mapToProductResponse(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        return dto;
    }
}