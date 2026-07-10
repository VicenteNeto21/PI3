package com.siti.sitiapi.service;

import com.siti.sitiapi.dto.RouteGenerationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RouteOptimizationService {

    private final JdbcTemplate jdbc;
    private final EmailService emailService;

    public Map<String, Object> generateRouteAndTrip(RouteGenerationRequest request) {
        Long pollId = request.getPollId();

        // 1. Verificar total de passageiros para encontrar o onibus ideal
        Integer totalPassengers = jdbc.queryForObject(
                "SELECT COUNT(DISTINCT id_passenger) FROM passenger_votes WHERE poll_id = ?",
                Integer.class, pollId
        );
        if (totalPassengers == null || totalPassengers == 0) {
            throw new RuntimeException("Não há votos nesta enquete para gerar uma rota.");
        }

        // 2. Buscar pontos únicos de embarque e desembarque
        List<Long> uniqueStops = jdbc.queryForList(
                "SELECT boarding_stop_id FROM passenger_votes WHERE poll_id = ? " +
                "UNION " +
                "SELECT alighting_stop_id FROM passenger_votes WHERE poll_id = ?",
                Long.class, pollId, pollId
        );

        // Remover inicio e fim se eles já estiverem na lista
        uniqueStops.remove(request.getStartStopId());
        uniqueStops.remove(request.getEndStopId());

        // 3. Verificar necessidade de acessibilidade
        Boolean requiresAccessibility = jdbc.queryForObject(
                "SELECT EXISTS(" +
                "    SELECT 1 FROM passenger_votes pv " +
                "    JOIN passengers p ON pv.id_passenger = p.id " +
                "    WHERE pv.poll_id = ? AND p.type = 'Necessita Acessibilidade'" +
                ")",
                Boolean.class, pollId
        );
        boolean needsAccess = (requiresAccessibility != null && requiresAccessibility);

        // 4. Escolher o Veículo (Maior ou igual à demanda e checando acessibilidade)
        String busQuery = "SELECT id FROM buses WHERE capacity >= ? AND operation_status = 'Ativo' ";
        if (needsAccess) {
            busQuery += "AND accessibility = 1 ";
        }
        busQuery += "ORDER BY capacity ASC LIMIT 1";

        List<Long> buses = jdbc.queryForList(busQuery, Long.class, totalPassengers);
        Long busId;
        if (!buses.isEmpty()) {
            busId = buses.get(0);
        } else {
            // Fallback para o maior ônibus disponível (respeitando acessibilidade se exigida)
            String fallbackQuery = "SELECT id FROM buses WHERE operation_status = 'Ativo' ";
            if (needsAccess) {
                fallbackQuery += "AND accessibility = 1 ";
            }
            fallbackQuery += "ORDER BY capacity DESC LIMIT 1";

            List<Long> largestBuses = jdbc.queryForList(fallbackQuery, Long.class);
            if (largestBuses.isEmpty()) {
                throw new RuntimeException(needsAccess ? 
                    "Nenhum ônibus com acessibilidade ativo disponível no sistema para atender a demanda." : 
                    "Nenhum ônibus ativo disponível no sistema.");
            }
            busId = largestBuses.get(0);
        }

        // 4. Criar a Rota
        String routeCode = "RT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String routeName = "Rota Gerada Enquete " + pollId;
        
        KeyHolder routeKeyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO routes (code, name, description, status) VALUES (?, ?, ?, 'Ativa')",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, routeCode);
            ps.setString(2, routeName);
            ps.setString(3, "Rota gerada automaticamente via inteligência de enquetes");
            return ps;
        }, routeKeyHolder);
        Long newRouteId = routeKeyHolder.getKey().longValue();

        // 5. Inserir paradas (Ordem: Start -> Pontos Intermediários -> End)
        int order = 1;
        insertRouteStop(newRouteId, request.getStartStopId(), order++);
        for (Long stopId : uniqueStops) {
            insertRouteStop(newRouteId, stopId, order++);
        }
        insertRouteStop(newRouteId, request.getEndStopId(), order);

        // 6. Criar a Viagem (Trip)
        KeyHolder tripKeyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO trips (date, status, id_route, id_bus, id_driver) VALUES (CURRENT_DATE, 'Agendada', ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, newRouteId);
            ps.setLong(2, busId);
            ps.setLong(3, request.getDriverId());
            return ps;
        }, tripKeyHolder);
        Long tripId = tripKeyHolder.getKey().longValue();

        // 7. Vincular Passageiros à Trip e Enviar Notificações
        List<Long> passengerIds = jdbc.queryForList(
                "SELECT DISTINCT id_passenger FROM passenger_votes WHERE poll_id = ?",
                Long.class, pollId
        );
        String busNickname = jdbc.queryForObject(
                "SELECT COALESCE(nickname, license_plate) FROM buses WHERE id = ?", String.class, busId);

        for (Long passengerId : passengerIds) {
            jdbc.update(
                    "INSERT INTO passenger_trips (id_passenger, id_trip) VALUES (?, ?)",
                    passengerId, tripId
            );
            
            List<String> emails = jdbc.queryForList(
                    "SELECT email FROM users WHERE id = ?", String.class, passengerId
            );
            if (!emails.isEmpty()) {
                emailService.sendSimpleMessage(
                        emails.get(0),
                        "Sua Rota SITI foi confirmada!",
                        "A viagem foi gerada com sucesso e sairá no horário previsto: " + request.getDepartureTime() + 
                        ". O veículo designado é: " + busNickname
                );
            }
        }
        
        // Finaliza a enquete
        jdbc.update("UPDATE polls SET status = 'Fechada' WHERE id = ?", pollId);

        return Map.of(
                "success", true,
                "routeId", newRouteId,
                "tripId", tripId,
                "busId", busId,
                "totalPassengers", totalPassengers
        );
    }

    private void insertRouteStop(Long routeId, Long stopId, int order) {
        jdbc.update(
                "INSERT INTO route_stops (id_route, id_stop, stop_order) VALUES (?, ?, ?)",
                routeId, stopId, order
        );
    }

    // Dummy methods to satisfy VotingScheduler compilation
    public void optimizeStopsForToday() {}
    public void analyzeCapacityAndDemand() {}
}
