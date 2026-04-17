package com.phope.hope.Service;

import com.phope.hope.Entity.Product;
import com.phope.hope.Repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ✅ NEW: Delete product method
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}