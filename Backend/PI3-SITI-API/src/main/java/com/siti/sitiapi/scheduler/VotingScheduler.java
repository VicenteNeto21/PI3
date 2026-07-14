package com.siti.sitiapi.scheduler;

import com.siti.sitiapi.service.EmailService;
import com.siti.sitiapi.service.RouteOptimizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class VotingScheduler {

    private final JdbcTemplate jdbc;
    private final EmailService emailService;
    private final RouteOptimizationService routeOptimizationService;

    @Scheduled(fixedRate = 300000)
    public void checkVotingWindow() {
        LocalDateTime now = LocalDateTime.now();
        Timestamp in35min = Timestamp.valueOf(now.plusMinutes(35));
        Timestamp minus6min = Timestamp.valueOf(now.minusMinutes(6));
        Timestamp tsNow = Timestamp.valueOf(now);

        List<Map<String, Object>> closingPolls = jdbc.queryForList(
                "SELECT id, title, end_time FROM polls " +
                "WHERE status = 'Ativa' AND end_time > ? AND end_time <= ?",
                tsNow, in35min
        );

        for (Map<String, Object> poll : closingPolls) {
            Long pollId = ((Number) poll.get("id")).longValue();
            sendRemindersForPoll(pollId, (String) poll.get("title"));
        }

        List<Long> recentlyClosedPolls = jdbc.queryForList(
                "SELECT id FROM polls " +
                "WHERE status = 'Ativa' AND end_time <= ? AND end_time >= ?",
                Long.class, tsNow, minus6min
        );

        for (Long pollId : recentlyClosedPolls) {
            System.out.println("Fechando enquete " + pollId + " e otimizando rotas...");
            jdbc.update("UPDATE polls SET status = 'Fechada' WHERE id = ?", pollId);
            routeOptimizationService.optimizeStopsForToday();
            routeOptimizationService.analyzeCapacityAndDemand();
        }
    }

    private void sendRemindersForPoll(Long pollId, String pollTitle) {
        List<String> emails = jdbc.queryForList(
                "SELECT u.email FROM users u " +
                "JOIN passengers p ON u.id = p.id " +
                "WHERE u.id NOT IN (SELECT id_passenger FROM passenger_votes WHERE poll_id = ?)", 
                String.class, pollId);

        for (String email : emails) {
            emailService.sendSimpleMessage(email, 
                    "Lembrete: A enquete '" + pollTitle + "' encerra em breve!", 
                    "Não esqueça de registrar seu interesse de viagem para esta enquete no app SITI.");
        }
    }
}
