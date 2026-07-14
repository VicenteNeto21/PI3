package com.siti.sitiapi.service;

import com.siti.sitiapi.repository.AdminRepository;
import com.siti.sitiapi.repository.UserRepository;
import com.siti.sitiapi.repository.PassengerRepository;
import com.siti.sitiapi.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PassengerRepository passengerRepository;

    public List<Map<String, Object>> getPendingHomologations() {
        return adminRepository.getPendingHomologations();
    }

    @Transactional
    public void homologate(Long id) {
        adminRepository.approveHomologation(id);
        
        // Garante que o registro de passageiro correspondente existe
        if (!passengerRepository.existsById(id)) {
            passengerRepository.create(
                    id,
                    LocalDate.of(1998, 5, 15),
                    "(88) 99999-9999",
                    "Estudante",
                    "20260042",
                    "comprovante_matricula_2026.pdf",
                    null
            );
        }
    }

    @Transactional
    public void reject(Long id) {
        adminRepository.rejectHomologation(id);
    }

    public List<Map<String, Object>> getPassengers() {
        return adminRepository.getAllPassengers();
    }

    @Transactional
    public Map<String, Object> createPassenger(Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String email = (String) payload.get("email");
        String document = (String) payload.get("document");
        String phone = (String) payload.get("phone");
        String type = (String) payload.get("type");
        String registrationCode = (String) payload.get("registrationCode");

        userRepository.create(email, "123456", document, name);
        User user = userRepository.findByEmail(email);
        
        adminRepository.approveHomologation(user.getId());
        
        passengerRepository.create(
                user.getId(),
                LocalDate.of(2000, 1, 1),
                phone != null ? phone : "",
                type != null ? type : "Estudante",
                registrationCode != null ? registrationCode : "",
                "comprovante_matricula_2026.pdf",
                null
        );

        return Map.of(
                "id", user.getId(),
                "name", name,
                "email", email,
                "status", "Ativo"
        );
    }

    @Transactional
    public Map<String, Object> updatePassenger(Long id, Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String phone = (String) payload.get("phone");
        String type = (String) payload.get("type");
        String registrationCode = (String) payload.get("registrationCode");

        adminRepository.updatePassenger(id, name, phone, type, registrationCode);
        
        return Map.of("success", true, "message", "Dados atualizados com sucesso!");
    }

    @Transactional
    public Map<String, Object> deletePassenger(Long id) {
        adminRepository.deletePassenger(id);
        return Map.of("success", true, "message", "Aluno inativado com sucesso!");
    }

    public List<Map<String, Object>> getRoutes() {
        return adminRepository.getRoutes();
    }

    public List<Map<String, Object>> getVehicles() {
        return adminRepository.getVehicles();
    }

    @Transactional
    public Map<String, Object> updateVehicle(Long id, Map<String, Object> payload) {
        String plate = (String) payload.get("plate");
        String model = (String) payload.get("model");
        String year = String.valueOf(payload.get("year"));
        int capacity = ((Number) payload.get("capacity")).intValue();
        String status = (String) payload.getOrDefault("status", "Ativo");
        Object accObj = payload.get("accessibility");
        boolean accessibility;
        if (accObj instanceof Boolean) {
            accessibility = (Boolean) accObj;
        } else {
            String accStr = (String) accObj;
            accessibility = "Sim".equalsIgnoreCase(accStr) || "Sim (Elevador)".equalsIgnoreCase(accStr);
        }

        adminRepository.updateVehicle(id, plate, model, year, capacity, accessibility, status);
        return Map.of("success", true, "message", "Veículo atualizado com sucesso!");
    }

    @Transactional
    public Map<String, Object> deleteVehicle(Long id) {
        adminRepository.deleteVehicle(id);
        return Map.of("success", true, "message", "Veículo removido com sucesso!");
    }

    @Transactional
    public Map<String, Object> assignDriverToVehicle(Long vehicleId, Map<String, Object> payload) {
        Object driverIdObj = payload.get("driverId");
        if (driverIdObj == null) {
            adminRepository.unassignDriverFromVehicle(vehicleId);
            return Map.of("success", true, "message", "Motorista desvinculado do veículo!");
        }
        Long driverId = ((Number) driverIdObj).longValue();
        adminRepository.assignDriverToVehicle(vehicleId, driverId);
        return Map.of("success", true, "message", "Motorista atribuído ao veículo com sucesso!");
    }

    public Map<String, Object> createVehicle(Map<String, Object> payload) {
        String plate = (String) payload.get("plate");
        String model = (String) payload.get("model");
        String year = String.valueOf(payload.get("year"));
        int capacity = ((Number) payload.get("capacity")).intValue();
        
        Object accObj = payload.get("accessibility");
        boolean accessibility;
        String accStr;
        if (accObj instanceof Boolean) {
            accessibility = (Boolean) accObj;
            accStr = accessibility ? "Sim" : "Não";
        } else {
            accStr = (String) accObj;
            accessibility = "Sim".equalsIgnoreCase(accStr) || "Sim (Elevador)".equalsIgnoreCase(accStr);
        }

        Long id = adminRepository.insertVehicle(plate, model, year, capacity, accessibility);
        
        return Map.of(
                "id", id,
                "plate", plate,
                "model", model,
                "year", year,
                "capacity", capacity,
                "accessibility", accStr != null ? accStr : "Sim",
                "status", "Ativo",
                "votes", 0
        );
    }

    public List<Map<String, Object>> getDrivers() {
        return adminRepository.getDrivers();
    }

    private LocalDate parseLocalDate(String dateStr, LocalDate defaultDate) {
        if (dateStr == null || dateStr.isBlank()) {
            return defaultDate;
        }
        try {
            if (dateStr.contains("/")) {
                String[] parts = dateStr.split("/");
                if (parts.length == 3) {
                    return LocalDate.of(Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
                }
            }
            if (dateStr.contains("-")) {
                String[] parts = dateStr.split("-");
                if (parts.length == 3) {
                    return LocalDate.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), Integer.parseInt(parts[2].substring(0, 2)));
                }
            }
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            return defaultDate;
        }
    }

    @Transactional
    public Map<String, Object> updateDriver(Long id, Map<String, Object> payload) {
        String name = (String) payload.getOrDefault("name", "Motorista");
        String cnh = (String) payload.getOrDefault("cnh", "00000000000");
        String category = (String) payload.getOrDefault("category", "D");
        if (category != null && category.contains("/")) {
            category = category.split("/")[0].trim();
        }
        String birthDateStr = (String) payload.get("birthDate");
        String validityStr = (String) payload.get("validity");
        String phone = (String) payload.getOrDefault("phone", "");
        String cpf = (String) payload.get("cpf");

        LocalDate birthDate = parseLocalDate(birthDateStr, LocalDate.of(1985, 1, 1));
        LocalDate validity = parseLocalDate(validityStr, LocalDate.of(2030, 12, 31));

        adminRepository.updateDriver(id, name, phone, java.sql.Date.valueOf(birthDate), cnh, category, java.sql.Date.valueOf(validity), cpf);
        return Map.of("success", true, "message", "Motorista atualizado com sucesso!");
    }

    @Transactional
    public Map<String, Object> deleteDriver(Long id) {
        adminRepository.deleteDriver(id);
        return Map.of("success", true, "message", "Motorista removido com sucesso!");
    }

    @Transactional
    public Map<String, Object> createDriver(Map<String, Object> payload) {
        String name = (String) payload.getOrDefault("name", "Motorista");
        String cnh = (String) payload.getOrDefault("cnh", "00000000000");
        String category = (String) payload.getOrDefault("category", "D");
        if (category != null && category.contains("/")) {
            category = category.split("/")[0].trim();
        }
        String birthDateStr = (String) payload.get("birthDate");
        String validityStr = (String) payload.get("validity");
        String phone = (String) payload.getOrDefault("phone", "");
        String email = (String) payload.get("email");
        if (email == null || email.isBlank()) {
            email = "motorista_" + System.currentTimeMillis() + "@siti.com";
        }
        String cpf = (String) payload.get("cpf");
        if (cpf == null || cpf.isBlank()) {
            cpf = cnh;
        }
        String password = (String) payload.get("password");
        if (password == null || password.isBlank()) {
            password = "123456";
        }

        LocalDate birthDate = parseLocalDate(birthDateStr, LocalDate.of(1985, 1, 1));
        LocalDate validity = parseLocalDate(validityStr, LocalDate.of(2030, 12, 31));

        // 1. Cadastra ou recupera o usuário
        User user = userRepository.findByEmail(email);
        if (user == null) {
            userRepository.create(email, password, cpf, name);
            user = userRepository.findByEmail(email);
        } else {
            userRepository.updateUserForDriver(user.getId(), name, cpf, password);
        }
        if (user == null) {
            throw new RuntimeException("Erro ao criar usuário para o motorista.");
        }

        // Ativa o usuário
        adminRepository.approveHomologation(user.getId());

        // 2. Cadastra ou atualiza o motorista no banco de dados
        adminRepository.insertDriver(
                user.getId(), name, phone, java.sql.Date.valueOf(birthDate), cnh, category, java.sql.Date.valueOf(validity), cpf
        );

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", user.getId());
        response.put("name", name);
        response.put("cnh", cnh);
        response.put("category", category);
        response.put("birthDate", birthDate.toString());
        response.put("validity", validity.toString());
        response.put("phone", phone);
        response.put("email", email);
        response.put("cpf", cpf != null ? cpf : "000.000.000-00");
        response.put("status", "Ativo");
        return response;
    }

    public Map<String, Object> getSettings() {
        List<Map<String, Object>> settings = adminRepository.getSettings();
        if (settings.isEmpty()) {
            return Map.of(
                    "openTime", "06:00",
                    "closeTime", "17:00",
                    "blockedNextDay", false
            );
        }
        return settings.get(0);
    }

    public Map<String, Object> updateSettings(Map<String, Object> payload) {
        String openTime = (String) payload.get("openTime");
        String closeTime = (String) payload.get("closeTime");
        boolean blockedNextDay = (Boolean) payload.get("blockedNextDay");

        adminRepository.updateSettings(openTime, closeTime, blockedNextDay);
        return Map.of(
                "openTime", openTime,
                "closeTime", closeTime,
                "blockedNextDay", blockedNextDay
        );
    }

    public Map<String, Object> createNotice(Map<String, Object> payload) {
        String title = (String) payload.get("title");
        String message = (String) payload.get("message");

        Long id = adminRepository.insertNotice(title, message);
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        return Map.of(
                "id", id,
                "date", today,
                "title", title,
                "message", message
        );
    }

    public List<Map<String, Object>> getSupportMessages() {
        return adminRepository.getSupportMessages();
    }

    @Transactional
    public Map<String, Object> createRoute(Map<String, Object> payload) {
        String code = (String) payload.get("code");
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");

        Long routeId = adminRepository.insertRoute(code, name, description);

        List<Map<String, Object>> stops = (List<Map<String, Object>>) payload.get("stops");
        if (stops != null) {
            int order = 1;
            for (Map<String, Object> stop : stops) {
                String street = (String) stop.get("street");
                String time = (String) stop.get("time");

                Long addressId = adminRepository.insertAddress(street);
                Long scheduleId = adminRepository.insertSchedule(time);

                Long stopId = adminRepository.insertStop(addressId);
                
                adminRepository.insertRouteStop(routeId, stopId, order++);
                adminRepository.insertStopSchedule(stopId, scheduleId);
            }
        }

        return Map.of("success", true, "message", "Rota criada com sucesso", "id", routeId);
    }

    public Map<String, Object> blockVoting(boolean block) {
        adminRepository.updateSettings("06:00", "17:00", block);
        return Map.of("success", true, "blockedNextDay", block);
    }

    public List<Map<String, Object>> getPassengerReports() {
        return adminRepository.getPassengerReports();
    }

    public List<Map<String, Object>> getStops() {
        return adminRepository.getStops();
    }

    public Map<String, Object> createStop(Map<String, Object> payload) {
        String street = (String) payload.get("street");
        String neighborhood = (String) payload.getOrDefault("neighborhood", "");
        String buildingNumber = (String) payload.getOrDefault("buildingNumber", "");
        Long addressId = adminRepository.insertAddress(street, neighborhood, buildingNumber);
        Long stopId = adminRepository.insertStop(addressId);
        return Map.of("success", true, "id", stopId, "addressId", addressId);
    }

    public List<Map<String, Object>> getSchedules() {
        return adminRepository.getSchedules();
    }

    public Map<String, Object> createSchedule(Map<String, Object> payload) {
        String time = (String) payload.get("time");
        if (time == null || time.isBlank()) {
            throw new IllegalArgumentException("Horário não pode ser vazio.");
        }
        Long scheduleId = adminRepository.insertSchedule(time);
        return Map.of("success", true, "id", scheduleId, "time", time);
    }

    @Transactional
    public Map<String, Object> replaceVehicle(Long routeId, Map<String, Object> payload) {
        Long newBusId = ((Number) payload.get("newBusId")).longValue();
        adminRepository.updateTripVehicle(routeId, newBusId);
        return Map.of("success", true, "message", "Ônibus substituído com sucesso na rota " + routeId);
    }

    @Transactional
    public Map<String, Object> deleteStop(Long id) {
        adminRepository.deleteStop(id);
        return Map.of("success", true, "message", "Parada removida com sucesso");
    }
}
