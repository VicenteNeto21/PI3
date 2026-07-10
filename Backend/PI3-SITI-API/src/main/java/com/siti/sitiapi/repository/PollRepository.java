package com.siti.sitiapi.repository;

import com.siti.sitiapi.dto.PollCreateRequest;
import com.siti.sitiapi.dto.PollResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class PollRepository {

    private final JdbcTemplate jdbc;

    public Long createPoll(PollCreateRequest request) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO polls (title, description, start_time, end_time, status) " +
                    "VALUES (?, ?, ?, ?, 'Pendente')",
                    new String[]{"id"}
            );
            ps.setString(1, request.getTitle());
            ps.setString(2, request.getDescription());
            ps.setTimestamp(3, Timestamp.valueOf(request.getStartTime()));
            ps.setTimestamp(4, Timestamp.valueOf(request.getEndTime()));
            return ps;
        }, keyHolder);
        Long pollId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;

        if (pollId != null) {
            if (request.getBoardingStops() != null) {
                for (Long stopId : request.getBoardingStops()) {
                    jdbc.update("INSERT INTO poll_boarding_stops (poll_id, stop_id) VALUES (?, ?)", pollId, stopId);
                }
            }
            if (request.getAlightingStops() != null) {
                for (Long stopId : request.getAlightingStops()) {
                    jdbc.update("INSERT INTO poll_alighting_stops (poll_id, stop_id) VALUES (?, ?)", pollId, stopId);
                }
            }
            if (request.getSchedules() != null) {
                for (Long scheduleId : request.getSchedules()) {
                    jdbc.update("INSERT INTO poll_schedules (poll_id, schedule_id) VALUES (?, ?)", pollId, scheduleId);
                }
            }
        }
        return pollId;
    }

    public List<PollResponse> findAll() {
        return jdbc.query(
                "SELECT id, title, description, start_time, end_time, status FROM polls",
                (rs, rowNum) -> new PollResponse(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getTimestamp("start_time").toLocalDateTime(),
                        rs.getTimestamp("end_time").toLocalDateTime(),
                        rs.getString("status")
                )
        );
    }

    public List<PollResponse> findActivePolls() {
        return jdbc.query(
                "SELECT id, title, description, start_time, end_time, status FROM polls " +
                "WHERE status = 'Ativa' AND CURRENT_TIMESTAMP BETWEEN start_time AND end_time",
                (rs, rowNum) -> new PollResponse(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getString("description"),
                        rs.getTimestamp("start_time").toLocalDateTime(),
                        rs.getTimestamp("end_time").toLocalDateTime(),
                        rs.getString("status")
                )
        );
    }

    public java.util.Map<String, Object> getPollOptions(Long id) {
        List<java.util.Map<String, Object>> boardingStops = jdbc.query(
                "SELECT s.id, a.neighborhood, a.street FROM stops s " +
                "JOIN addresses a ON s.id_address = a.id " +
                "JOIN poll_boarding_stops pbs ON s.id = pbs.stop_id WHERE pbs.poll_id = ?",
                (rs, rowNum) -> java.util.Map.of("id", rs.getLong("id"), "neighborhood", rs.getString("neighborhood"), "street", rs.getString("street")),
                id
        );

        List<java.util.Map<String, Object>> alightingStops = jdbc.query(
                "SELECT s.id, a.neighborhood, a.street FROM stops s " +
                "JOIN addresses a ON s.id_address = a.id " +
                "JOIN poll_alighting_stops pas ON s.id = pas.stop_id WHERE pas.poll_id = ?",
                (rs, rowNum) -> java.util.Map.of("id", rs.getLong("id"), "neighborhood", rs.getString("neighborhood"), "street", rs.getString("street")),
                id
        );

        List<java.util.Map<String, Object>> schedules = jdbc.query(
                "SELECT sch.id, sch.time FROM schedules sch " +
                "JOIN poll_schedules ps ON sch.id = ps.schedule_id WHERE ps.poll_id = ?",
                (rs, rowNum) -> java.util.Map.of("id", rs.getLong("id"), "time", rs.getString("time")),
                id
        );

        return java.util.Map.of(
                "boardingStops", boardingStops,
                "alightingStops", alightingStops,
                "schedules", schedules
        );
    }

    public void publishPoll(Long id) {
        int updated = jdbc.update("UPDATE polls SET status = 'Ativa' WHERE id = ? AND status = 'Pendente'", id);
        if (updated == 0) {
            throw new RuntimeException("Enquete não encontrada ou já foi publicada/encerrada.");
        }
    }
}
