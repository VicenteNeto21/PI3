package com.siti.sitiapi.controller;

import com.siti.sitiapi.dto.PollCreateRequest;
import com.siti.sitiapi.service.PollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/polls")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;

    @PostMapping
    public ResponseEntity<?> createPoll(@RequestBody PollCreateRequest request, @RequestAttribute("role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            return ResponseEntity.ok(pollService.createPoll(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPolls(@RequestAttribute("role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(pollService.getAllPolls());
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActivePolls(@RequestAttribute("role") String role) {
        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(pollService.getActivePolls());
    }

    @GetMapping("/{id}/options")
    public ResponseEntity<?> getPollOptions(@PathVariable Long id, @RequestAttribute("role") String role) {
        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            return ResponseEntity.ok(pollService.getPollOptions(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<?> publishPoll(@PathVariable Long id, @RequestAttribute("role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            return ResponseEntity.ok(pollService.publishPoll(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
