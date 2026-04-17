package com.phope.hope.Service;

import com.phope.hope.DTO.DashboardStatsDTO;
import com.phope.hope.Entity.Order;
import com.phope.hope.Entity.OrderStatus;
import com.phope.hope.Entity.PaymentStatus;
import com.phope.hope.Repository.OrderRepository;
import com.phope.hope.Repository.TransactionRepository;
import com.phope.hope.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class AdminService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public AdminService(OrderRepository orderRepository, UserRepository userRepository, TransactionRepository transactionRepository) {
            this.orderRepository = orderRepository;
            this.userRepository = userRepository;
            this.transactionRepository = transactionRepository;
    }

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO dashboardStatsDTO = new DashboardStatsDTO();

        List<Order> orders = orderRepository.findAll();
        dashboardStatsDTO.setTotalOrders(orders.size());

        BigDecimal totalRevenue = orders.stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.RELEASED)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboardStatsDTO.setTotalRevenue(totalRevenue);

        BigDecimal pendingEscrow = orders.stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.PAID && !order.isEscrowReleased())
                .map(Order:: getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboardStatsDTO.setPendingEscrow(pendingEscrow);


        BigDecimal totalRefunded = orders.stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.REFUNDED)
                .map(Order:: getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboardStatsDTO.setTotalRefunded(totalRefunded);

        dashboardStatsDTO.setTotalUsers(userRepository.count());

        Map<String, Long> ordersByStatus = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getStatus().name(),
                        Collectors.counting()
                ));

        dashboardStatsDTO.setOrdersByStatus(ordersByStatus);

        return dashboardStatsDTO;



    }
    public List<Order> getPendingEscrowOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.PAID
                        && !order.isEscrowReleased())
                .collect(Collectors.toList());
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == status)
                .collect(Collectors.toList());
    }

}
