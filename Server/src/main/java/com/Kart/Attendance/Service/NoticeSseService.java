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
    // Map of tenantId -> list of active emitters
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter registerEmitter(String tenantId) {
        if (tenantId == null) {
            tenantId = "default";
        }
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L); // 24 hours timeout
        
        List<SseEmitter> tenantEmitters = emitters.computeIfAbsent(tenantId, k -> new CopyOnWriteArrayList<>());
        tenantEmitters.add(emitter);

        final String finalTenantId = tenantId;
        emitter.onCompletion(() -> removeEmitter(finalTenantId, emitter));
        emitter.onTimeout(() -> removeEmitter(finalTenantId, emitter));
        emitter.onError((e) -> removeEmitter(finalTenantId, emitter));

        // Send an initial heartbeat/ack
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected"));
        } catch (IOException e) {
            removeEmitter(finalTenantId, emitter);
        }

        return emitter;
    }

    public void broadcastNotice(String tenantId, Notice notice) {
        if (tenantId == null) {
            tenantId = "default";
        }
        List<SseEmitter> tenantEmitters = emitters.get(tenantId);
        if (tenantEmitters == null || tenantEmitters.isEmpty()) return;

        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : tenantEmitters) {
            try {
                emitter.send(SseEmitter.event().name("NEW_NOTICE").data(notice));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        
        tenantEmitters.removeAll(deadEmitters);
    }

    private void removeEmitter(String tenantId, SseEmitter emitter) {
        List<SseEmitter> tenantEmitters = emitters.get(tenantId);
        if (tenantEmitters != null) {
            tenantEmitters.remove(emitter);
        }
    }
}
