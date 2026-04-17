package com.phope.hope.DTO;

import java.time.LocalDateTime;

public class NotificationDTO {
    private String type;
    private String message;
    private Object data;
    private LocalDateTime timestamp;

    public NotificationDTO() {
        this.timestamp = LocalDateTime.now();
    }

    public NotificationDTO(String type, String message, Object data) {
        this.type = type;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

}
