package com.siti.sitiapi.service;

import com.siti.sitiapi.dto.ErrorResponse;
import com.siti.sitiapi.dto.PassengerCreateRequest;
import com.siti.sitiapi.dto.PassengerResponse;
import com.siti.sitiapi.exception.BusinessException;
import com.siti.sitiapi.model.Passenger;
import com.siti.sitiapi.model.User;
import com.siti.sitiapi.repository.PassengerRepository;
import com.siti.sitiapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PassengerService {

    private final PassengerRepository passengerRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbc;
    private final EmailService emailService;

    public PassengerResponse create(PassengerCreateRequest request) {
        User user = userRepository.findById(request.getIdUser());
        if (user == null) {
            throw new BusinessException(
                    new ErrorResponse(400, "Usuário não encontrado para o ID informado.", "/passengers/create")
            );
        }

        if (passengerRepository.existsById(request.getIdUser())) {
            throw new BusinessException(
                    new ErrorResponse(400, "Passageiro já cadastrado para este usuário.", "/passengers/create")
            );
        }

        passengerRepository.create(
                request.getIdUser(),
                request.getBirthDate(),
                request.getPhone(),
                request.getType(),
                request.getRegistrationNumber(),
                request.getBondProof(),
                request.getIdAddress()
        );

        Passenger passenger = passengerRepository.findById(request.getIdUser());

        PassengerResponse response = new PassengerResponse();
        response.setId(passenger.getId());
        response.setEmail(user.getEmail());
        response.setStatus(user.getStatus());
        response.setBirthDate(passenger.getBirthDate());
        response.setPhone(passenger.getPhone());
        response.setType(passenger.getType());
        response.setRegistrationNumber(passenger.getRegistrationNumber());
        response.setBondProof(passenger.getBondProof());
        response.setIdAddress(passenger.getIdAddress());
        return response;
    }

    public List<Map<String, Object>> getRoutes() {
        List<Map<String, Object>> routes = jdbc.query(
                "SELECT id, code, name FROM routes WHERE status = 'Ativa' OR status = 'Ativo'",
                (rs, rowNum) -> Map.of(
                        "id", String.valueOf(rs.getLong("id")),
                        "code", rs.getString("code") != null ? rs.getString("code") : "",
                        "name", rs.getString("name") != null ? rs.getString("name") : ""
                )
        );

        return routes.stream().map(route -> {
            String routeId = (String) route.get("id");
            List<String> stops = jdbc.query(
                    "SELECT a.street AS stop FROM route_stops rs " +
                    "JOIN stops s ON rs.id_stop = s.id " +
                    "JOIN addresses a ON s.id_address = a.id " +
                    "WHERE rs.id_route = ? ORDER BY rs.stop_order",
                    (rs, rowNum) -> rs.getString("stop"),
                    Long.parseLong(routeId)
            );

            List<Boolean> accessList = jdbc.query(
                    "SELECT b.accessibility FROM trips t JOIN buses b ON t.id_bus = b.id WHERE t.id_route = ? AND t.date = CURRENT_DATE() LIMIT 1",
                    (rs, rowNum) -> rs.getBoolean("accessibility"),
                    Long.parseLong(routeId)
            );
            String accessibility = (!accessList.isEmpty() && accessList.get(0)) ? "Sim (Elevador)" : "Não";

            List<String> timeList = jdbc.query(
                    "SELECT sch.time FROM route_stops rs " +
                    "JOIN stop_schedules ss ON ss.id_stop = rs.id_stop " +
                    "JOIN schedules sch ON ss.id_schedule = sch.id " +
                    "WHERE rs.id_route = ? ORDER BY rs.stop_order LIMIT 1",
                    (rs, rowNum) -> rs.getString("time"),
                    Long.parseLong(routeId)
            );
            String time = !timeList.isEmpty() ? timeList.get(0) : "18:00";

            return Map.of(
                    "id", routeId,
                    "code", route.get("code"),
                    "name", route.get("name"),
                    "stops", stops,
                    "accessibility", accessibility,
                    "time", time
            );
        }).collect(java.util.stream.Collectors.toList());
    }

    public Map<String, Object> getProfile(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        Passenger passenger = passengerRepository.findById(user.getId());
        if (passenger == null) {
            // Se o passageiro não existe, cria um padrão
            passengerRepository.create(
                    user.getId(),
                    LocalDate.of(1998, 5, 15),
                    "(88) 99999-9999",
                    "Campus Universitário",
                    "20260042",
                    "comprovante_matricula_2026.pdf",
                    null
            );
            passenger = passengerRepository.findById(user.getId());
        }

        String name = user.getName() != null ? user.getName() : email.split("@")[0];
        String reg = passenger.getRegistrationNumber() != null ? passenger.getRegistrationNumber() : "20260042";
        String inst = passenger.getType() != null ? passenger.getType() : "Campus Universitário";
        String photo = passenger.getPhotoUrl() != null ? passenger.getPhotoUrl() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

        return Map.of(
                "name", name,
                "registration", reg,
                "institution", inst,
                "status", user.getStatus() != null ? user.getStatus() : "Ativo",
                "photoUrl", photo
        );
    }

    public List<Map<String, Object>> getMyTrips(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }

        return jdbc.query(
                "SELECT t.id AS tripId, r.name AS routeName, r.code AS routeCode, " +
                "       t.date, t.status, " +
                "       COALESCE(b.nickname, b.license_plate) AS bus, " +
                "       d_user.name AS driverName " +
                "FROM passenger_trips pt " +
                "JOIN trips t ON pt.id_trip = t.id " +
                "JOIN routes r ON t.id_route = r.id " +
                "JOIN buses b ON t.id_bus = b.id " +
                "JOIN drivers d ON t.id_driver = d.id " +
                "JOIN users d_user ON d.id = d_user.id " +
                "WHERE pt.id_passenger = ? " +
                "ORDER BY t.date DESC",
                (rs, rowNum) -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("tripId", rs.getLong("tripId"));
                    map.put("routeName", rs.getString("routeName") != null ? rs.getString("routeName") : "");
                    map.put("routeCode", rs.getString("routeCode") != null ? rs.getString("routeCode") : "");
                    map.put("date", rs.getDate("date") != null ? rs.getDate("date").toString() : "");
                    map.put("status", rs.getString("status") != null ? rs.getString("status") : "");
                    map.put("bus", rs.getString("bus") != null ? rs.getString("bus") : "");
                    map.put("driverName", rs.getString("driverName") != null ? rs.getString("driverName") : "");
                    return map;
                },
                user.getId()
        );
    }

    public Map<String, Object> vote(String email, com.siti.sitiapi.dto.VoteSubmitRequest payload) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }

        // Verifica se a enquete está ativa
        Boolean isActive = jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM polls WHERE id = ? AND status = 'Ativa' AND CURRENT_TIMESTAMP BETWEEN start_time AND end_time)",
                Boolean.class, payload.getPollId()
        );
        if (Boolean.FALSE.equals(isActive)) {
            throw new RuntimeException("Esta enquete não está ativa ou fora do horário permitido.");
        }

        // Remove voto anterior para esta mesma enquete (caso o usuário queira mudar o voto)
        jdbc.update("DELETE FROM passenger_votes WHERE id_passenger = ? AND poll_id = ?", user.getId(), payload.getPollId());

        // Registra o novo voto
        passengerRepository.submitVote(
                user.getId(),
                payload.getPollId(),
                payload.getBoardingStopId(),
                payload.getBoardingScheduleId(),
                payload.getAlightingStopId(),
                payload.getAlightingScheduleId()
        );

        return Map.of(
                "success", true,
                "pollId", payload.getPollId(),
                "message", "Voto registrado com sucesso"
        );
    }

    public List<Map<String, Object>> getNotices(String email) {
        User user = userRepository.findByEmail(email);
        Long userId = user != null ? user.getId() : -1L;

        return jdbc.query(
                "SELECT n.id, n.created_at, n.title, n.message, " +
                "       CASE WHEN nr.id IS NOT NULL THEN true ELSE false END AS `read` " +
                "FROM notices n " +
                "LEFT JOIN notice_reads nr ON nr.notice_id = n.id AND nr.user_id = ? " +
                "ORDER BY n.created_at DESC",
                (rs, rowNum) -> {
                    java.sql.Timestamp ts = rs.getTimestamp("created_at");
                    String dateStr = ts != null ? ts.toLocalDateTime().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
                    return Map.of(
                        "id", rs.getLong("id"),
                        "date", dateStr,
                        "title", rs.getString("title") != null ? rs.getString("title") : "",
                        "message", rs.getString("message") != null ? rs.getString("message") : "",
                        "read", rs.getBoolean("read")
                    );
                },
                userId
        );
    }

    public Map<String, Object> markAsRead(String email, Long noticeId) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }

        jdbc.update(
                "INSERT IGNORE INTO notice_reads (user_id, notice_id) VALUES (?, ?)",
                user.getId(), noticeId
        );

        return Map.of("success", true, "noticeId", noticeId);
    }

    public Map<String, Object> markAllAsRead(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }

        jdbc.update(
                "INSERT IGNORE INTO notice_reads (user_id, notice_id) " +
                "SELECT ?, id FROM notices WHERE id NOT IN (SELECT notice_id FROM notice_reads WHERE user_id = ?)",
                user.getId(), user.getId()
        );

        return Map.of("success", true);
    }

    public Map<String, Object> getContacts(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }

        Map<String, Object> driverContact = Map.of(
                "name", "Carlos Silva (Motorista)",
                "phone", "(88) 98888-7777",
                "route", "Rota Universitária - Crateús (Ida)"
        );

        try {
            List<Map<String, Object>> realDriver = jdbc.query(
                    "SELECT d.name, d.phone, r.name AS route " +
                    "FROM trips t " +
                    "JOIN drivers d ON t.id_driver = d.id " +
                    "JOIN routes r ON t.id_route = r.id " +
                    "LIMIT 1",
                    (rs, rowNum) -> Map.of(
                            "name", rs.getString("name") + " (Motorista)",
                            "phone", rs.getString("phone"),
                            "route", rs.getString("route")
                    )
            );
            if (!realDriver.isEmpty()) {
                driverContact = realDriver.get(0);
            }
        } catch (Exception e) {
            // ignora fallback
        }

        return Map.of(
                "driver", driverContact,
                "admin", Map.of(
                        "name", "Setor de Transportes",
                        "phone", "(88) 3691-1234",
                        "email", "transportes@siti.edu.br"
                )
        );
    }

    public Map<String, Object> submitSupport(String email, Map<String, Object> payload) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        String subject = (String) payload.get("subject");
        String message = (String) payload.get("message");
        String vehiclePlate = (String) payload.get("vehiclePlate");

        jdbc.update("INSERT INTO support_messages (user_id, subject, message) VALUES (?, ?, ?)",
                user.getId(), subject, message);

        emailService.sendSimpleMessage("transportes@siti.edu.br", 
                "Novo Suporte SITI: " + subject, 
                "Mensagem de: " + email + "\n\n" + message);

        if (vehiclePlate != null && !vehiclePlate.isBlank()) {
            jdbc.update("UPDATE buses SET operation_status = 'Manutenção' WHERE license_plate = ?", vehiclePlate);
        }

        return Map.of(
                "success", true,
                "subject", subject,
                "message", message
        );
    }

    public Map<String, Object> uploadPhoto(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        String photoUrl = "https://imagens-siti.s3.amazonaws.com/perfis/" + user.getId() + ".jpg";
        passengerRepository.updatePhotoUrl(user.getId(), photoUrl);

        return Map.of(
                "success", true,
                "photoUrl", photoUrl
        );
    }

    public Map<String, Object> updateProfile(String email, Map<String, Object> payload) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            String name = payload.get("name") != null ? payload.get("name").toString() : 
                          (payload.get("nome") != null ? payload.get("nome").toString() : null);
            String phone = payload.get("phone") != null ? payload.get("phone").toString() : 
                           (payload.get("telefone") != null ? payload.get("telefone").toString() : null);
            String registration = payload.get("registration") != null ? payload.get("registration").toString() : 
                                  (payload.get("matricula") != null ? payload.get("matricula").toString() : null);
            String institution = payload.get("institution") != null ? payload.get("institution").toString() : 
                                 (payload.get("campus") != null ? payload.get("campus").toString() : null);

            if (name != null && !name.isBlank()) {
                jdbc.update("UPDATE users SET name = ? WHERE id = ?", name, user.getId());
            }
            if (phone != null && !phone.isBlank()) {
                jdbc.update("UPDATE passengers SET phone = ? WHERE id = ?", phone, user.getId());
            }
            if (registration != null && !registration.isBlank()) {
                jdbc.update("UPDATE passengers SET registration_number = ? WHERE id = ?", registration, user.getId());
            }
            if (institution != null && !institution.isBlank()) {
                jdbc.update("UPDATE passengers SET type = ? WHERE id = ?", institution, user.getId());
            }
        }
        return getProfile(email);
    }
}
