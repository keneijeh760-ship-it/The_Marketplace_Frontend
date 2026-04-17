package com.phope.hope.Service;

import com.phope.hope.DTO.CartItemResponseDTO;
import com.phope.hope.DTO.ProductResponseDTO;
import com.phope.hope.Entity.CartItem;
import com.phope.hope.Entity.Product;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.CartItemRepository;
import com.phope.hope.Repository.ProductRepository;
import com.phope.hope.exception.CartItemNotFoundException;
import com.phope.hope.exception.ProductNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public List<CartItemResponseDTO> getUserCart(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        return cartItems.stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponseDTO addToCart(User user, Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(String.valueOf(productId)));

        // Check if item already exists in cart
        CartItem cartItem = cartItemRepository.findByUserAndProduct(user, product)
                .orElse(new CartItem(user, product, 0));

        cartItem.setQuantity(cartItem.getQuantity() + quantity);
        CartItem saved = cartItemRepository.save(cartItem);

        return mapToCartItemResponse(saved);
    }

    @Transactional
    public CartItemResponseDTO updateQuantity(User user, Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException(String.valueOf(cartItemId)));

        if (cartItem.getUser().getId() != user.getId()) {
            throw new AccessDeniedException("Cart item does not belong to the current user");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        CartItem saved = cartItemRepository.save(cartItem);

        return mapToCartItemResponse(saved);
    }

    @Transactional
    public void removeFromCart(User user, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException(String.valueOf(cartItemId)));

        if (cartItem.getUser().getId() != user.getId()) {
            throw new AccessDeniedException("Cart item does not belong to the current user");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }

    public BigDecimal getCartTotal(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        return cartItems.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CartItemResponseDTO mapToCartItemResponse(CartItem cartItem) {
        CartItemResponseDTO dto = new CartItemResponseDTO();
        dto.setId(cartItem.getId());
        dto.setProduct(mapToProductResponse(cartItem.getProduct()));
        dto.setQuantity(cartItem.getQuantity());
        dto.setSubtotal(cartItem.getSubtotal());
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