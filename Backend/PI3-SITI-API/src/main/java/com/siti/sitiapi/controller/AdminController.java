package com.siti.sitiapi.controller;

import com.siti.sitiapi.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final com.siti.sitiapi.service.RouteOptimizationService routeOptimizationService;

    private boolean isNotAdmin(String role) {
        return !"ADMIN".equals(role);
    }

    @GetMapping("/pending-homologations")
    public ResponseEntity<?> getPendingHomologations(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getPendingHomologations());
    }

    @PostMapping("/homologate/{id}")
    public ResponseEntity<?> homologate(@PathVariable Long id, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            adminService.homologate(id);
            return ResponseEntity.ok(Map.of("success", true, "id", id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            adminService.reject(id);
            return ResponseEntity.ok(Map.of("success", true, "id", id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/passengers")
    public ResponseEntity<?> getPassengers(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getPassengers());
    }

    @PostMapping("/passengers")
    public ResponseEntity<?> createPassenger(@RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.createPassenger(payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/passengers/{id}")
    public ResponseEntity<?> updatePassenger(@PathVariable Long id, @RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.updatePassenger(id, payload);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/passengers/{id}")
    public ResponseEntity<?> deletePassenger(@PathVariable Long id, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.deletePassenger(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/routes")
    public ResponseEntity<?> getRoutes(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getRoutes());
    }

    @GetMapping("/vehicles")
    public ResponseEntity<?> getVehicles(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getVehicles());
    }

    @PostMapping("/vehicles")
    public ResponseEntity<?> createVehicle(@RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.createVehicle(payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.updateVehicle(id, payload);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.deleteVehicle(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/vehicles/{id}/driver")
    public ResponseEntity<?> assignDriver(@PathVariable Long id, @RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.assignDriverToVehicle(id, payload);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/drivers")
    public ResponseEntity<?> getDrivers(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getDrivers());
    }

    @PostMapping("/drivers")
    public ResponseEntity<?> createDriver(@RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.createDriver(payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/drivers/{id}")
    public ResponseEntity<?> updateDriver(@PathVariable Long id, @RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.updateDriver(id, payload);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<?> deleteDriver(@PathVariable Long id, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.deleteDriver(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            Map<String, Object> result = adminService.updateSettings(payload);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/notices")
    public ResponseEntity<?> createNotice(@RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (!"ADMIN".equals(role) && !"DRIVE".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            Map<String, Object> result = adminService.createNotice(payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/support-messages")
    public ResponseEntity<?> getSupportMessages(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getSupportMessages());
    }

    @PostMapping("/routes")
    public ResponseEntity<?> createRoute(@RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createRoute(payload));
    }

    @PostMapping("/settings/block-voting")
    public ResponseEntity<?> blockVoting(@RequestBody Map<String, Boolean> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        Boolean block = payload.getOrDefault("block", true);
        return ResponseEntity.ok(adminService.blockVoting(block));
    }

    @GetMapping("/reports/passengers")
    public ResponseEntity<?> getPassengerReports(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getPassengerReports());
    }

    @PutMapping("/routes/{routeId}/replace-vehicle")
    public ResponseEntity<?> replaceVehicle(@PathVariable Long routeId, @RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.replaceVehicle(routeId, payload));
    }

    @PostMapping("/routes/generate")
    public ResponseEntity<?> generateRoute(@RequestBody com.siti.sitiapi.dto.RouteGenerationRequest request, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            return ResponseEntity.ok(routeOptimizationService.generateRouteAndTrip(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stops")
    public ResponseEntity<?> getStops(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getStops());
    }

    @PostMapping("/stops")
    public ResponseEntity<?> createStop(@RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createStop(payload));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/stops/{id}")
    public ResponseEntity<?> deleteStop(@PathVariable Long id, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            return ResponseEntity.ok(adminService.deleteStop(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/schedules")
    public ResponseEntity<?> getSchedules(@RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(adminService.getSchedules());
    }

    @PostMapping("/schedules")
    public ResponseEntity<?> createSchedule(@RequestBody Map<String, Object> payload, @RequestAttribute("role") String role) {
        if (isNotAdmin(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createSchedule(payload));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
