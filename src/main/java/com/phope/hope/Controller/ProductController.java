package com.phope.hope.Controller;

import com.phope.hope.Entity.Product;
import com.phope.hope.Entity.User;
import com.phope.hope.Repository.UserRepository;
import com.phope.hope.Service.ProductService;
import com.phope.hope.Service.S3Service;
import com.phope.hope.exception.ProductNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    public ProductController(ProductService productService, UserRepository userRepository, S3Service s3Service) {
        this.productService = productService;
        this.userRepository = userRepository;
        this.s3Service = s3Service;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getAllProducts().stream()
                .filter(p -> p.getId() == id)
                .findFirst()
                .orElseThrow(() -> new ProductNotFoundException(String.valueOf(id)));
        return ResponseEntity.ok(product);
    }

    // Image upload endpoint
    @PostMapping("/upload-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            String imageUrl = s3Service.uploadImage(file);
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload image: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            Authentication authentication) {

        String email = authentication.getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        product.setSeller(seller);

        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            Authentication authentication) {

        Product existingProduct = productService.getAllProducts().stream()
                .filter(p -> p.getId() == id)
                .findFirst()
                .orElseThrow(() -> new ProductNotFoundException(String.valueOf(id)));

        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (existingProduct.getSeller().getId() != currentUser.getId()
                && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        product.setId(id);
        product.setSeller(existingProduct.getSeller());
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {

        Product existingProduct = productService.getAllProducts().stream()
                .filter(p -> p.getId() == id)
                .findFirst()
                .orElseThrow(() -> new ProductNotFoundException(String.valueOf(id)));

        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (existingProduct.getSeller().getId() != currentUser.getId()
                && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        // Delete image from S3 if exists
        if (existingProduct.getImageUrl() != null && !existingProduct.getImageUrl().isEmpty()) {
            s3Service.deleteImage(existingProduct.getImageUrl());
        }

        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted");
    }
}