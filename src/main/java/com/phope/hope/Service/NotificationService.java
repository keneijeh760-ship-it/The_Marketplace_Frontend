package com.phope.hope.Service;

import com.phope.hope.DTO.NotificationDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendToUser(Long userId, NotificationDTO notificationDTO) {
        messagingTemplate.convertAndSend("/queue/"+userId+"/notifications", notificationDTO);
    }

    public void broadcast(String topic, NotificationDTO notificationDTO) {
        messagingTemplate.convertAndSend("/topic/" + topic, notificationDTO);
    }

    public void notifyOrderUpdate(Long userId, String message, Object orderData) {
        NotificationDTO notification = new NotificationDTO(
                "ORDER_UPDATE",
                message,
                orderData
        );
        sendToUser(userId, notification);
    }

    public void notifyBalanceUpdate(Long userId, String message, Object balanceData) {
        NotificationDTO notification = new NotificationDTO(
                "BALANCE_UPDATE",
                message,
                balanceData
        );
        sendToUser(userId, notification);
    }

    public void notifyNewOrder(Long sellerId, String message, Object orderData) {
        NotificationDTO notification = new NotificationDTO(
                "NEW_ORDER",
                message,
                orderData
        );
        sendToUser(sellerId, notification);
    }
}
