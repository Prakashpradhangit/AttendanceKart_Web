package com.Kart.Attendance.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ConcurrentHashMap;
import com.Kart.Attendance.Entity.Notice;

@Service
public class NoticeSseService {
    private record SseClient(SseEmitter emitter, String role, Long userId, Long adminId) {}

    // Map of tenantId -> list of active SSE clients
    private final Map<String, List<SseClient>> clients = new ConcurrentHashMap<>();

    public SseEmitter registerEmitter(String tenantId, String role, Long userId, Long adminId) {
        if (tenantId == null) {
            tenantId = "default";
        }
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L); // 24 hours timeout
        
        SseClient client = new SseClient(emitter, role, userId, adminId);
        List<SseClient> tenantClients = clients.computeIfAbsent(tenantId, k -> new CopyOnWriteArrayList<>());
        tenantClients.add(client);

        final String finalTenantId = tenantId;
        emitter.onCompletion(() -> removeClient(finalTenantId, client));
        emitter.onTimeout(() -> removeClient(finalTenantId, client));
        emitter.onError((e) -> removeClient(finalTenantId, client));

        // Send an initial heartbeat/ack
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected"));
        } catch (IOException e) {
            removeClient(finalTenantId, client);
        }

        return emitter;
    }

    public void broadcastNotice(String tenantId, Notice notice) {
        if (tenantId == null) {
            tenantId = "default";
        }
        List<SseClient> tenantClients = clients.get(tenantId);
        if (tenantClients == null || tenantClients.isEmpty()) return;

        List<SseClient> deadClients = new CopyOnWriteArrayList<>();
        for (SseClient client : tenantClients) {
            try {
                client.emitter().send(SseEmitter.event().name("NEW_NOTICE").data(notice));
            } catch (Exception e) {
                deadClients.add(client);
            }
        }
        
        tenantClients.removeAll(deadClients);
    }

    public void forceLogoutUser(String tenantId, Long userId) {
        if (userId == null) return;
        sendForceLogout(tenantId, client -> "USER".equals(client.role()) && userId.equals(client.userId()));
    }

    public void forceLogoutTenant(String tenantId) {
        sendForceLogout(tenantId, client -> "ADMIN".equals(client.role()) || "USER".equals(client.role()));
    }

    private void sendForceLogout(String tenantId, java.util.function.Predicate<SseClient> shouldLogout) {
        if (tenantId == null) {
            tenantId = "default";
        }
        List<SseClient> tenantClients = clients.get(tenantId);
        if (tenantClients == null || tenantClients.isEmpty()) return;

        List<SseClient> deadClients = new CopyOnWriteArrayList<>();
        for (SseClient client : tenantClients) {
            if (!shouldLogout.test(client)) continue;
            try {
                client.emitter().send(SseEmitter.event().name("FORCE_LOGOUT").data("Account inactive"));
                client.emitter().complete();
                deadClients.add(client);
            } catch (Exception e) {
                deadClients.add(client);
            }
        }

        tenantClients.removeAll(deadClients);
    }

    private void removeClient(String tenantId, SseClient client) {
        List<SseClient> tenantClients = clients.get(tenantId);
        if (tenantClients != null) {
            tenantClients.remove(client);
        }
    }
}
