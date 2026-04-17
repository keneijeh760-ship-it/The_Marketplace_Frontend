package com.phope.hope.DTO;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardStatsDTO {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal pendingEscrow;
    private long totalUsers;
    private Map<String, Long> ordersByStatus;
    private BigDecimal totalRefunded;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(long totalOrders, BigDecimal totalRevenue, BigDecimal pendingEscrow, long totalUsers, Map<String, Long> ordersByStatus, BigDecimal totalRefunded) {
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.pendingEscrow = pendingEscrow;
        this.totalUsers = totalUsers;
        this.ordersByStatus = ordersByStatus;
        this.totalRefunded = totalRefunded;

    }

    public  Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }

    public BigDecimal getTotalRefunded() {
        return totalRefunded;
    }

    public BigDecimal getPendingEscrow() {
        return pendingEscrow;

    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public long getTotalUsers(){
        return totalUsers;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void  setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public void  setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public void setTotalRefunded(BigDecimal totalRefunded) {
        this.totalRefunded = totalRefunded;
    }

    public void setPendingEscrow(BigDecimal pendingEscrow) {
        this.pendingEscrow = pendingEscrow;
    }

    public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }


}
