package com.siti.sitiapi.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class AdminRepository {

    private final JdbcTemplate jdbc;

    public List<Map<String, Object>> getPendingHomologations() {
        return jdbc.query(
                "SELECT u.id, u.name, u.email, u.identifier_document AS document, " +
                "       COALESCE(p.bond_proof, 'comprovante_matricula_2026.pdf') AS bondFile, " +
                "       u.status " +
                "FROM users u " +
                "LEFT JOIN passengers p ON u.id = p.id " +
                "WHERE u.status = 'Pendente'",
                (rs, rowNum) -> Map.of(
                        "id", rs.getLong("id"),
                        "name", rs.getString("name") != null ? rs.getString("name") : "",
                        "email", rs.getString("email") != null ? rs.getString("email") : "",
                        "document", rs.getString("document") != null ? rs.getString("document") : "",
                        "bondFile", rs.getString("bondFile") != null ? rs.getString("bondFile") : "",
                        "status", rs.getString("status") != null ? rs.getString("status") : "Pendente"
                )
        );
    }

    public void approveHomologation(Long id) {
        jdbc.update("UPDATE users SET status = 'Ativo' WHERE id = ?", id);
    }

    public void rejectHomologation(Long id) {
        jdbc.update("UPDATE users SET status = 'Rejeitado' WHERE id = ?", id);
    }

    public List<Map<String, Object>> getAllPassengers() {
        return jdbc.query(
                "SELECT u.id, u.name, u.email, u.identifier_document AS document, " +
                "       COALESCE(p.phone, '') AS phone, " +
                "       COALESCE(p.type, 'Estudante') AS type, " +
                "       COALESCE(p.registration_number, '') AS registrationCode, " +
                "       u.status " +
                "FROM users u " +
                "JOIN passengers p ON u.id = p.id",
                (rs, rowNum) -> Map.of(
                        "id", rs.getLong("id"),
                        "name", rs.getString("name") != null ? rs.getString("name") : "",
                        "email", rs.getString("email") != null ? rs.getString("email") : "",
                        "document", rs.getString("document") != null ? rs.getString("document") : "",
                        "phone", rs.getString("phone") != null ? rs.getString("phone") : "",
                        "type", rs.getString("type") != null ? rs.getString("type") : "",
                        "registrationCode", rs.getString("registrationCode") != null ? rs.getString("registrationCode") : "",
                        "status", rs.getString("status") != null ? rs.getString("status") : ""
                )
        );
    }

    public void updatePassenger(Long id, String name, String phone, String type, String registrationCode) {
        jdbc.update("UPDATE users SET name = ? WHERE id = ?", name, id);
        jdbc.update("UPDATE passengers SET phone = ?, type = ?, registration_number = ? WHERE id = ?", 
                    phone, type, registrationCode, id);
    }

    public void deletePassenger(Long id) {
        jdbc.update("UPDATE users SET status = 'Inativo' WHERE id = ?", id);
    }

    public List<Map<String, Object>> getRoutes() {
        List<Map<String, Object>> routes = jdbc.query(
                "SELECT id, code, name, status FROM routes",
                (rs, rowNum) -> Map.of(
                        "id", rs.getLong("id"),
                        "code", rs.getString("code") != null ? rs.getString("code") : "",
                        "name", rs.getString("name") != null ? rs.getString("name") : "",
                        "status", rs.getString("status") != null ? rs.getString("status") : "Ativa"
                )
        );

        return routes.stream().map(route -> {
            Long routeId = (Long) route.get("id");
            // Busca paradas via route_stops e seus horários via stop_schedules
            List<Map<String, Object>> stopDetails = jdbc.query(
                    "SELECT a.street AS stop, sch.time AS time " +
                    "FROM route_stops rs " +
                    "JOIN stops s ON rs.id_stop = s.id " +
                    "JOIN addresses a ON s.id_address = a.id " +
                    "LEFT JOIN stop_schedules ss ON ss.id_stop = s.id " +
                    "LEFT JOIN schedules sch ON ss.id_schedule = sch.id " +
                    "WHERE rs.id_route = ? " +
                    "ORDER BY rs.stop_order",
                    (rs, rowNum) -> Map.of(
                            "stop", rs.getString("stop") != null ? rs.getString("stop") : "",
                            "time", rs.getString("time") != null ? rs.getString("time") : ""
                    ),
                    routeId
            );

            String stops = stopDetails.stream()
                    .map(m -> (String) m.get("stop"))
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .collect(java.util.stream.Collectors.joining(", "));

            String times = stopDetails.stream()
                    .map(m -> (String) m.get("time"))
                    .filter(t -> !t.isEmpty())
                    .distinct()
                    .collect(java.util.stream.Collectors.joining(", "));

            return Map.of(
                    "id", routeId,
                    "code", route.get("code"),
                    "name", route.get("name"),
                    "stops", stops,
                    "times", times,
                    "status", route.get("status")
            );
        }).collect(java.util.stream.Collectors.toList());
    }

    public List<Map<String, Object>> getVehicles() {
        return jdbc.query(
                "SELECT b.id, b.nickname, b.license_plate AS plate, b.bus_model AS model, b.manufacturing_year, b.capacity, " +
                "       CASE WHEN b.accessibility = 1 THEN 'Sim' ELSE 'Não' END AS accessibility, " +
                "       COALESCE(b.operation_status, 'Ativo') AS status, " +
                "       (SELECT COUNT(DISTINCT pv.id_passenger) " +
                "        FROM passenger_votes pv " +
                "        WHERE pv.voted_date = CURRENT_DATE " +
                "          AND pv.boarding_stop_id IN ( " +
                "              SELECT rs2.id_stop FROM route_stops rs2 " +
                "              JOIN trips t ON t.id_route = rs2.id_route " +
                "              WHERE t.id_bus = b.id AND t.date = CURRENT_DATE " +
                "          ) " +
                "       ) AS votes " +
                "FROM buses b",
                (rs, rowNum) -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", rs.getLong("id"));
                    map.put("nickname", rs.getString("nickname") != null ? rs.getString("nickname") : "");
                    map.put("plate", rs.getString("plate") != null ? rs.getString("plate") : "");
                    map.put("model", rs.getString("model") != null ? rs.getString("model") : "");
                    map.put("year", rs.getString("manufacturing_year") != null ? rs.getString("manufacturing_year") : "");
                    map.put("capacity", rs.getInt("capacity"));
                    map.put("accessibility", rs.getString("accessibility") != null ? rs.getString("accessibility") : "Não");
                    map.put("status", rs.getString("status") != null ? rs.getString("status") : "Ativo");
                    map.put("votes", rs.getLong("votes"));
                    return map;
                }
        );
    }

    public Long insertVehicle(String plate, String model, String year, int capacity, boolean accessibility) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO buses (license_plate, bus_model, manufacturing_year, capacity, accessibility, operation_status) " +
                    "VALUES (?, ?, ?, ?, ?, 'Ativo')",
                    new String[]{"id"}
            );
            ps.setString(1, plate);
            ps.setString(2, model);
            ps.setString(3, year);
            ps.setInt(4, capacity);
            ps.setBoolean(5, accessibility);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public List<Map<String, Object>> getDrivers() {
        return jdbc.query(
                "SELECT d.id, d.name, d.cnh_number AS cnh, d.cnh_category AS category, " +
                "       d.birth_date AS birthDate, d.cnh_validity_date AS validity, " +
                "       d.phone, u.email, COALESCE(u.status, 'Ativo') AS status " +
                "FROM drivers d " +
                "JOIN users u ON d.id = u.id",
                (rs, rowNum) -> {
                    java.sql.Date birthDateSql = rs.getDate("birthDate");
                    java.sql.Date validitySql = rs.getDate("validity");
                    return Map.of(
                        "id", rs.getLong("id"),
                        "name", rs.getString("name") != null ? rs.getString("name") : "",
                        "cnh", rs.getString("cnh") != null ? rs.getString("cnh") : "",
                        "category", rs.getString("category") != null ? rs.getString("category") : "",
                        "birthDate", birthDateSql != null ? birthDateSql.toString() : "",
                        "validity", validitySql != null ? validitySql.toString() : "",
                        "phone", rs.getString("phone") != null ? rs.getString("phone") : "",
                        "email", rs.getString("email") != null ? rs.getString("email") : "",
                        "status", rs.getString("status")
                    );
                }
        );
    }

    public void insertDriver(Long id, String name, String phone, java.sql.Date birthDate, String cnh, String category, java.sql.Date validity) {
        jdbc.update(
                "INSERT INTO drivers (id, name, phone, birth_date, cnh_number, cnh_category, cnh_validity_date, id_address) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, NULL)",
                id, name, phone, birthDate, cnh, category, validity
        );
    }

    public void updateDriver(Long id, String name, String phone, java.sql.Date birthDate, String cnh, String category, java.sql.Date validity) {
        jdbc.update("UPDATE users SET name = ? WHERE id = ?", name, id);
        jdbc.update(
                "UPDATE drivers SET name = ?, phone = ?, birth_date = ?, cnh_number = ?, cnh_category = ?, cnh_validity_date = ? WHERE id = ?",
                name, phone, birthDate, cnh, category, validity, id
        );
    }

    public void deleteDriver(Long id) {
        jdbc.update("UPDATE users SET status = 'Inativo' WHERE id = ?", id);
    }

    public List<Map<String, Object>> getSettings() {
        return jdbc.query(
                "SELECT open_time, close_time, blocked_next_day FROM settings LIMIT 1",
                (rs, rowNum) -> Map.of(
                        "openTime", rs.getString("open_time") != null ? rs.getString("open_time") : "06:00",
                        "closeTime", rs.getString("close_time") != null ? rs.getString("close_time") : "17:00",
                        "blockedNextDay", rs.getBoolean("blocked_next_day")
                )
        );
    }

    public void updateSettings(String openTime, String closeTime, boolean blockedNextDay) {
        int count = jdbc.queryForObject("SELECT COUNT(*) FROM settings", Integer.class);
        if (count == 0) {
            jdbc.update("INSERT INTO settings (open_time, close_time, blocked_next_day) VALUES (?, ?, ?)",
                    openTime, closeTime, blockedNextDay);
        } else {
            jdbc.update("UPDATE settings SET open_time = ?, close_time = ?, blocked_next_day = ?",
                    openTime, closeTime, blockedNextDay);
        }
    }

    public Long insertNotice(String title, String message) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO notices (title, message) VALUES (?, ?)",
                    new String[]{"id"}
            );
            ps.setString(1, title);
            ps.setString(2, message);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public List<Map<String, Object>> getSupportMessages() {
        return jdbc.query(
                "SELECT sm.id, sm.user_id AS userId, u.name AS userName, u.email AS userEmail, " +
                "       sm.subject, sm.message, sm.created_at " +
                "FROM support_messages sm " +
                "JOIN users u ON sm.user_id = u.id",
                (rs, rowNum) -> {
                    java.sql.Timestamp ts = rs.getTimestamp("created_at");
                    String dateStr = "";
                    if (ts != null) {
                        dateStr = ts.toLocalDateTime().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                    }
                    return Map.of(
                        "id", rs.getLong("id"),
                        "userId", rs.getLong("userId"),
                        "userName", rs.getString("userName") != null ? rs.getString("userName") : "",
                        "userEmail", rs.getString("userEmail") != null ? rs.getString("userEmail") : "",
                        "subject", rs.getString("subject") != null ? rs.getString("subject") : "",
                        "message", rs.getString("message") != null ? rs.getString("message") : "",
                        "date", dateStr
                    );
                }
        );
    }

    public Long insertRoute(String code, String name, String description) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO routes (code, name, description, status) VALUES (?, ?, ?, 'Ativa')",
                    new String[]{"id"}
            );
            ps.setString(1, code);
            ps.setString(2, name);
            ps.setString(3, description);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public Long insertAddress(String street) {
        return insertAddress(street, null, null);
    }

    public Long insertAddress(String street, String neighborhood, String buildingNumber) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO addresses (street, neighborhood, building_number) VALUES (?, ?, ?)",
                    new String[]{"id"}
            );
            ps.setString(1, street);
            ps.setString(2, neighborhood);
            ps.setString(3, buildingNumber);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public Long insertSchedule(String time) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO schedules (time) VALUES (?)",
                    new String[]{"id"}
            );
            ps.setString(1, time);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public Long insertStop(Long addressId) {
        org.springframework.jdbc.support.KeyHolder keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
        jdbc.update(connection -> {
            java.sql.PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO stops (status, id_address) VALUES ('Ativo', ?)",
                    new String[]{"id"}
            );
            ps.setLong(1, addressId);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public void insertRouteStop(Long routeId, Long stopId, int order) {
        jdbc.update("INSERT INTO route_stops (id_route, id_stop, stop_order) VALUES (?, ?, ?)", routeId, stopId, order);
    }

    public void insertStopSchedule(Long stopId, Long scheduleId) {
        jdbc.update("INSERT INTO stop_schedules (id_stop, id_schedule) VALUES (?, ?)", stopId, scheduleId);
    }

    public void updateVehicle(Long id, String plate, String model, String year, int capacity, boolean accessibility, String status) {
        jdbc.update(
            "UPDATE buses SET license_plate = ?, bus_model = ?, manufacturing_year = ?, capacity = ?, accessibility = ?, operation_status = ? WHERE id = ?",
            plate, model, year, capacity, accessibility, status, id
        );
    }

    public void deleteVehicle(Long id) {
        jdbc.update("DELETE FROM buses WHERE id = ?", id);
    }

    public void updateTripVehicle(Long routeId, Long newBusId) {
        jdbc.update("UPDATE trips SET id_bus = ? WHERE id_route = ? AND date = CURRENT_DATE", newBusId, routeId);
    }

    public List<Map<String, Object>> getStops() {
        return jdbc.query(
                "SELECT s.id, s.status, a.street, a.neighborhood, a.building_number " +
                "FROM stops s JOIN addresses a ON s.id_address = a.id",
                (rs, rowNum) -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", rs.getLong("id"));
                    map.put("status", rs.getString("status"));
                    map.put("street", rs.getString("street"));
                    map.put("neighborhood", rs.getString("neighborhood"));
                    map.put("buildingNumber", rs.getString("building_number"));
                    return map;
                }
        );
    }

    public List<Map<String, Object>> getSchedules() {
        return jdbc.query(
                "SELECT id, time FROM schedules",
                (rs, rowNum) -> java.util.Map.of("id", rs.getLong("id"), "time", rs.getString("time"))
        );
    }

    public List<Map<String, Object>> getPassengerReports() {
        return jdbc.query(
                "SELECT r.name AS route, COUNT(DISTINCT pv.id_passenger) AS total_passengers " +
                "FROM routes r " +
                "LEFT JOIN route_stops rs ON rs.id_route = r.id " +
                "LEFT JOIN passenger_votes pv ON pv.boarding_stop_id = rs.id_stop " +
                "                            AND pv.voted_date = CURRENT_DATE " +
                "GROUP BY r.id, r.name",
                (rs, rowNum) -> Map.of(
                        "route", rs.getString("route") != null ? rs.getString("route") : "",
                        "total_passengers", rs.getInt("total_passengers")
                )
        );
    }
}
