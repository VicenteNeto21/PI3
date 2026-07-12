package com.siti.sitiapi.service;

import com.siti.sitiapi.dto.DriverCreateRequest;
import com.siti.sitiapi.dto.DriverResponse;
import com.siti.sitiapi.exception.BusinessException;
import com.siti.sitiapi.dto.ErrorResponse;
import com.siti.sitiapi.model.Driver;
import com.siti.sitiapi.model.User;
import com.siti.sitiapi.repository.DriverRepository;
import com.siti.sitiapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository repository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbc;

    public DriverResponse createDriver(DriverCreateRequest request) {
        User user = userRepository.findById(request.getIdUser());
        if (user == null) {
            throw new BusinessException(
                    new ErrorResponse(400, "Usuário não encontrado para o ID informado.", "/drivers/create")
            );
        }
        if (repository.existsById(request.getIdUser())) {
            throw new BusinessException(
                    new ErrorResponse(400, "Driver já cadastrado para este usuário.", "/drivers/create")
            );
        }

        repository.create(
            request.getIdUser(),
            request.getCnhNumber(),
            request.getCnhCategory(),
            request.getName(),
            request.getBirthDate(),
            request.getCnhValidityDate(),
            request.getPhone(),
            request.getIdAddress()
        );
        
        Driver driver = repository.findById(request.getIdUser());
        DriverResponse response = new DriverResponse();
        response.setId(driver.getId());
        response.setCnhNumber(driver.getCnhNumber());
        response.setCnhCategory(driver.getCnhCategory() != null ? driver.getCnhCategory().name() : null);
        response.setName(driver.getName());
        response.setBirthDate(driver.getBirthDate());
        response.setCnhValidityDate(driver.getCnhValidityDate());
        response.setPhone(driver.getPhone());
        response.setIdAddress(driver.getIdAddress());

        return response;
    }

    public List<Map<String, Object>> getRoutes(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Motorista não encontrado.");
        }

        List<Map<String, Object>> trips = jdbc.query(
                "SELECT t.id, r.code, r.name, t.status, " +
                "       COALESCE(b.nickname, b.license_plate) AS bus, " +
                "       (SELECT sch.time FROM route_stops rs " +
                "        JOIN stop_schedules ss ON ss.id_stop = rs.id_stop " +
                "        JOIN schedules sch ON ss.id_schedule = sch.id " +
                "        WHERE rs.id_route = r.id ORDER BY rs.stop_order LIMIT 1) AS time " +
                "FROM trips t " +
                "JOIN routes r ON t.id_route = r.id " +
                "JOIN buses b ON t.id_bus = b.id " +
                "WHERE t.id_driver = ? AND t.date = CURRENT_DATE()",
                (rs, rowNum) -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", rs.getLong("id"));
                    map.put("code", rs.getString("code") != null ? rs.getString("code") : "");
                    map.put("name", rs.getString("name") != null ? rs.getString("name") : "");
                    map.put("time", rs.getString("time") != null ? rs.getString("time") : "08:30");
                    map.put("bus", rs.getString("bus") != null ? rs.getString("bus") : "");
                    map.put("status", rs.getString("status") != null ? rs.getString("status") : "Agendada");
                    return map;
                },
                user.getId()
        );

        return trips;
    }

    public Map<String, Object> getProfile(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Motorista não encontrado.");
        }
        Driver driver = repository.findById(user.getId());
        if (driver == null) {
            throw new RuntimeException("Dados operacionais do motorista não encontrados.");
        }

        // Buscar as últimas 3 viagens (atuais ou futuras) do motorista
        List<Map<String, Object>> trips = jdbc.query(
                "SELECT t.id AS tripId, t.date, t.status AS tripStatus, " +
                "       b.nickname AS vehicleNickname, b.bus_model AS vehicleModel, " +
                "       b.license_plate AS vehiclePlate, b.capacity AS vehicleCapacity, " +
                "       b.manufacturing_year AS vehicleYear, b.operation_status AS vehicleStatus, " +
                "       b.accessibility AS vehicleAccessibility, " +
                "       r.name AS routeName " +
                "FROM trips t " +
                "JOIN buses b ON t.id_bus = b.id " +
                "JOIN routes r ON t.id_route = r.id " +
                "WHERE t.id_driver = ? AND t.status NOT IN ('Finalizada', 'Concluída') " +
                "ORDER BY t.date ASC, t.id ASC",
                (rs, rowNum) -> {
                    Map<String, Object> tripMap = new java.util.HashMap<>();
                    tripMap.put("tripId", rs.getLong("tripId"));
                    tripMap.put("date", rs.getDate("date") != null ? rs.getDate("date").toString() : "");
                    tripMap.put("status", rs.getString("tripStatus") != null ? rs.getString("tripStatus") : "");
                    tripMap.put("vehicleNickname", rs.getString("vehicleNickname") != null ? rs.getString("vehicleNickname") : "");
                    tripMap.put("vehicleModel", rs.getString("vehicleModel") != null ? rs.getString("vehicleModel") : "");
                    tripMap.put("vehiclePlate", rs.getString("vehiclePlate") != null ? rs.getString("vehiclePlate") : "");
                    tripMap.put("vehicleCapacity", rs.getInt("vehicleCapacity"));
                    tripMap.put("vehicleYear", rs.getString("vehicleYear") != null ? rs.getString("vehicleYear") : "");
                    tripMap.put("vehicleStatus", rs.getString("vehicleStatus") != null ? rs.getString("vehicleStatus") : "Ativo");
                    tripMap.put("vehicleAccessibility", rs.getBoolean("vehicleAccessibility"));
                    tripMap.put("routeName", rs.getString("routeName") != null ? rs.getString("routeName") : "");
                    return tripMap;
                },
                user.getId()
        );

        return Map.of(
                "id", user.getId(),
                "name", driver.getName() != null ? driver.getName() : "Carlos Motorista",
                "cnh", driver.getCnhNumber() != null ? driver.getCnhNumber() : "12345678901",
                "category", driver.getCnhCategory() != null ? driver.getCnhCategory().name() : "D",
                "birthDate", driver.getBirthDate() != null ? driver.getBirthDate().toString() : "1985-06-23",
                "validity", driver.getCnhValidityDate() != null ? driver.getCnhValidityDate().toString() : "2031-12-31",
                "phone", driver.getPhone() != null ? driver.getPhone() : "(88) 98888-7777",
                "email", email,
                "status", user.getStatus() != null ? user.getStatus() : "Ativo",
                "trips", trips
        );
    }

    public Map<String, Object> getVehicle(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Motorista não encontrado.");
        }

        List<Map<String, Object>> vehicles = jdbc.query(
                "SELECT b.id, b.nickname, b.bus_model AS model, b.license_plate AS plate, b.manufacturing_year, " +
                "       b.capacity, CASE WHEN b.accessibility = 1 THEN 'Sim (Elevador)' ELSE 'Não' END AS accessibility, " +
                "       COALESCE(b.operation_status, 'Ativo') AS status, " +
                "       r.name AS route_name " +
                "FROM trips t " +
                "JOIN buses b ON t.id_bus = b.id " +
                "JOIN routes r ON t.id_route = r.id " +
                "WHERE t.id_driver = ? AND t.date = CURRENT_DATE() LIMIT 1",
                (rs, rowNum) -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", rs.getLong("id"));
                    map.put("nickname", rs.getString("nickname") != null ? rs.getString("nickname") : "");
                    map.put("model", rs.getString("model") != null ? rs.getString("model") : "");
                    map.put("plate", rs.getString("plate") != null ? rs.getString("plate") : "");
                    map.put("year", rs.getString("manufacturing_year") != null ? rs.getString("manufacturing_year") : "");
                    map.put("capacity", rs.getInt("capacity"));
                    map.put("accessibility", rs.getString("accessibility") != null ? rs.getString("accessibility") : "Não");
                    map.put("status", rs.getString("status") != null ? rs.getString("status") : "Ativo");
                    map.put("route_name", rs.getString("route_name") != null ? rs.getString("route_name") : "");
                    return map;
                },
                user.getId()
        );

        if (vehicles.isEmpty()) {
            return Map.of(); // Retorna vazio se não tiver ônibus escalado hoje
        }

        return vehicles.get(0);
    }

    public List<Map<String, Object>> getPassengersByStop(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Motorista não encontrado.");
        }

        List<Map<String, Object>> trips = jdbc.query(
                "SELECT t.id, r.name FROM trips t " +
                "JOIN routes r ON t.id_route = r.id " +
                "WHERE t.id_driver = ? AND t.date = CURRENT_DATE() LIMIT 1",
                (rs, rowNum) -> Map.of("id", rs.getLong("id"), "name", rs.getString("name")),
                user.getId()
        );

        if (trips.isEmpty()) {
            return List.of();
        }

        Long tripId = (Long) trips.get(0).get("id");
        List<Map<String, Object>> passengers = getPassengers(tripId);

        Map<String, List<Map<String, Object>>> grouped = new java.util.LinkedHashMap<>();
        for (Map<String, Object> p : passengers) {
            String stop = (String) p.getOrDefault("boardingStop", "Sem parada definida");
            grouped.computeIfAbsent(stop, k -> new ArrayList<>()).add(p);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        int index = 1;
        for (Map.Entry<String, List<Map<String, Object>>> entry : grouped.entrySet()) {
            List<Map<String, Object>> students = entry.getValue().stream().map(s -> {
                boolean reqAcc = (boolean) s.getOrDefault("requiresAccessibility", false);
                return Map.of(
                    "id", s.get("id"),
                    "nome", s.get("name"),
                    "status", s.get("status"),
                    "requiresAccessibility", reqAcc,
                    "accessibilityDetail", reqAcc ? "Cadeirante - Necessita de Elevador" : ""
                );
            }).collect(java.util.stream.Collectors.toList());

            result.add(Map.of(
                "id", String.valueOf(index++),
                "nome", entry.getKey(),
                "estudantes", students
            ));
        }

        return result;
    }

    public Map<String, Object> updateTripStatus(Long id, Map<String, Object> payload) {
        String status = (String) payload.get("status");
        jdbc.update("UPDATE trips SET status = ? WHERE id = ?", status, id);

        return Map.of(
                "success", true,
                "id", id,
                "status", status
        );
    }

    public List<Map<String, Object>> getPassengers(Long tripId) {
        List<Map<String, Object>> passengers = jdbc.query(
                "SELECT u.id, u.name, p.registration_number AS registration, " +
                "       COALESCE(a_boarding.street, '') AS boardingStop, " +
                "       COALESCE(a_alighting.street, '') AS alightingStop, " +
                "       COALESCE(sch.time, '') AS boardingTime, " +
                "       p.photo_url AS photo, pv.status, " +
                "       CASE WHEN p.type = 'Necessita Acessibilidade' THEN 1 ELSE 0 END AS requiresAccessibility " +
                "FROM passenger_trips pt " +
                "JOIN passengers p ON pt.id_passenger = p.id " +
                "JOIN users u ON p.id = u.id " +
                "LEFT JOIN passenger_votes pv ON pv.id_passenger = p.id " +
                "    AND pv.poll_id = (SELECT t2.id_route FROM trips t2 WHERE t2.id = pt.id_trip) " +
                "LEFT JOIN stops s_b ON pv.boarding_stop_id = s_b.id " +
                "LEFT JOIN addresses a_boarding ON s_b.id_address = a_boarding.id " +
                "LEFT JOIN stops s_a ON pv.alighting_stop_id = s_a.id " +
                "LEFT JOIN addresses a_alighting ON s_a.id_address = a_alighting.id " +
                "LEFT JOIN schedules sch ON pv.boarding_schedule_id = sch.id " +
                "WHERE pt.id_trip = ?",
                (rs, rowNum) -> {
                    boolean reqAcc = rs.getInt("requiresAccessibility") == 1;
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", rs.getLong("id"));
                    map.put("name", rs.getString("name") != null ? rs.getString("name") : "");
                    map.put("registration", rs.getString("registration") != null ? rs.getString("registration") : "");
                    map.put("boardingStop", rs.getString("boardingStop"));
                    map.put("alightingStop", rs.getString("alightingStop"));
                    map.put("boardingTime", rs.getString("boardingTime"));
                    map.put("requiresAccessibility", reqAcc);
                    map.put("accessibilityDetail", reqAcc ? "Cadeirante - Necessita de Elevador" : "");
                    map.put("photo", rs.getString("photo") != null ? rs.getString("photo") : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
                    map.put("status", rs.getString("status") != null ? rs.getString("status") : "Pendente");
                    return map;
                },
                tripId
        );

        return passengers;
    }

    public Map<String, Object> updatePassengerStatus(Long passengerId, Map<String, Object> payload) {
        String status = (String) payload.get("status");

        // Atualiza o voto mais recente do passageiro
        jdbc.update("UPDATE passenger_votes SET status = ? WHERE id_passenger = ? AND voted_date = CURRENT_DATE() ORDER BY id DESC LIMIT 1",
                status, passengerId);

        return Map.of(
                "success", true,
                "id", passengerId,
                "status", status
        );
    }

    public Map<String, Object> reportFailure(Map<String, Object> payload) {
        String plate = (String) payload.get("vehiclePlate");
        String issue = (String) payload.get("issueType");
        String severity = (String) payload.get("severity");
        String desc = (String) payload.get("description");

        org.springframework.jdbc.support.KeyHolder keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
        jdbc.update(connection -> {
            java.sql.PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO failures (vehicle_plate, issue_type, severity, description, status) VALUES (?, ?, ?, ?, 'Registrado')",
                    new String[]{"id"}
            );
            ps.setString(1, plate);
            ps.setString(2, issue);
            ps.setString(3, severity);
            ps.setString(4, desc);
            return ps;
        }, keyHolder);

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        return Map.of(
                "id", keyHolder.getKey() != null ? keyHolder.getKey().longValue() : 0L,
                "date", today,
                "vehiclePlate", plate,
                "issueType", issue,
                "severity", severity,
                "description", desc,
                "status", "Registrado"
        );
    }

    public Map<String, Object> updateProfile(String email, Map<String, Object> payload) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            String name = payload.get("name") != null ? payload.get("name").toString() : 
                          (payload.get("nome") != null ? payload.get("nome").toString() : null);
            String phone = payload.get("phone") != null ? payload.get("phone").toString() : 
                           (payload.get("telefone") != null ? payload.get("telefone").toString() : null);
            if (name != null && !name.isBlank()) {
                jdbc.update("UPDATE users SET name = ? WHERE id = ?", name, user.getId());
                jdbc.update("UPDATE drivers SET name = ? WHERE id = ?", name, user.getId());
            }
            if (phone != null && !phone.isBlank()) {
                jdbc.update("UPDATE drivers SET phone = ? WHERE id = ?", phone, user.getId());
            }
        }
        return getProfile(email);
    }
}