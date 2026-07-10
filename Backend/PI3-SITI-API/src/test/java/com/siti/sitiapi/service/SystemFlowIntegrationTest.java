package com.siti.sitiapi.service;

import com.siti.sitiapi.dto.PollCreateRequest;
import com.siti.sitiapi.dto.RouteGenerationRequest;
import com.siti.sitiapi.dto.VoteSubmitRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional // Reverte todas as inserções após o teste!
@ActiveProfiles("test")
public class SystemFlowIntegrationTest {

    @MockBean
    private JavaMailSender javaMailSender;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PollService pollService;

    @Autowired
    private PassengerService passengerService;

    @Autowired
    private RouteOptimizationService routeOptimizationService;

    @Test
    public void testCompleteVotingAndRouteGenerationFlow() {
        System.out.println("==================================================");
        System.out.println("INICIANDO TESTE DE FLUXO: ENQUETE -> VOTO -> ROTA");
        System.out.println("==================================================");

        // 1. SETUP DE DADOS BÁSICOS (Mocking no BD)
        System.out.println("[1] Preparando dados básicos no banco de dados...");
        
        jdbc.update("INSERT INTO addresses (id, street, neighborhood) VALUES (1001, 'Rua A', 'Centro'), (1002, 'Rua B', 'Bairro 1'), (1003, 'Rua C', 'Bairro 2')");
        jdbc.update("INSERT INTO stops (id, status, id_address) VALUES (101, 'Ativo', 1001), (102, 'Ativo', 1002), (103, 'Ativo', 1003)");
        jdbc.update("INSERT INTO schedules (id, time) VALUES (201, '07:00'), (202, '07:30')");

        jdbc.update("INSERT INTO users (id, email, password, name, status) VALUES (301, 'joao@test.com', '123', 'João', 'Ativo'), (302, 'maria@test.com', '123', 'Maria', 'Ativo')");
        jdbc.update("INSERT INTO passengers (id, type) VALUES (301, 'Estudante'), (302, 'Estudante')");

        jdbc.update("INSERT INTO users (id, email, password, name, status) VALUES (401, 'admin@test.com', '123', 'Admin', 'Ativo'), (402, 'motorista@test.com', '123', 'Carlos Motorista', 'Ativo')");
        jdbc.update("INSERT INTO administrators (id, name) VALUES (401, 'Admin')");
        jdbc.update("INSERT INTO drivers (id, name, phone) VALUES (402, 'Carlos Motorista', '999999999')");
        
        jdbc.update("INSERT INTO buses (id, nickname, license_plate, capacity, operation_status) VALUES (501, 'Van Pequena', 'VAN-1111', 1, 'Ativo')");
        jdbc.update("INSERT INTO buses (id, nickname, license_plate, capacity, operation_status) VALUES (502, 'Ônibus Grande', 'BUS-2222', 50, 'Ativo')");

        System.out.println("  -> 3 Pontos, 2 Horários, 2 Passageiros, 1 Motorista, 2 Veículos (Caps: 1 e 50) criados.\n");

        // 2. ADMIN CRIA A ENQUETE
        System.out.println("[2] Admin está criando a enquete...");
        PollCreateRequest pollReq = new PollCreateRequest(
                "Enquete Matutina Teste", 
                "Para onde vamos?", 
                LocalDateTime.now().minusHours(1), // Começou há 1h
                LocalDateTime.now().plusHours(1),  // Termina em 1h
                java.util.List.of(101L, 102L, 103L),
                java.util.List.of(101L, 102L, 103L),
                java.util.List.of(201L, 202L)
        );
        Long pollId = pollService.createPoll(pollReq);
        assertNotNull(pollId, "O ID da enquete não pode ser nulo");
        System.out.println("  -> Enquete criada com sucesso! ID: " + pollId + "\n");

        // 3. PASSAGEIROS VOTAM
        System.out.println("[3] Passageiros estão votando na enquete...");
        
        // João vota (Embarca no 101 às 07:00, desce no 103 às 07:30)
        VoteSubmitRequest voteJoao = new VoteSubmitRequest(pollId, 101L, 201L, 103L, 202L);
        Map<String, Object> respJoao = passengerService.vote("joao@test.com", voteJoao);
        assertTrue((Boolean) respJoao.get("success"));
        System.out.println("  -> João votou com sucesso.");

        // Maria vota (Embarca no 102 às 07:00, desce no 103 às 07:30)
        VoteSubmitRequest voteMaria = new VoteSubmitRequest(pollId, 102L, 201L, 103L, 202L);
        Map<String, Object> respMaria = passengerService.vote("maria@test.com", voteMaria);
        assertTrue((Boolean) respMaria.get("success"));
        System.out.println("  -> Maria votou com sucesso.\n");

        // 4. ADMIN GERA A ROTA COM BASE NA ENQUETE
        System.out.println("[4] Admin está gerando a rota e viagem baseada nos votos...");
        RouteGenerationRequest routeReq = new RouteGenerationRequest(pollId, 101L, 103L, 402L, "08:00");
        Map<String, Object> resultRoute = routeOptimizationService.generateRouteAndTrip(routeReq);
        
        assertTrue((Boolean) resultRoute.get("success"));
        Long newRouteId = (Long) resultRoute.get("routeId");
        Long newTripId = (Long) resultRoute.get("tripId");
        Long selectedBusId = (Long) resultRoute.get("busId");
        Integer totalPassengers = (Integer) resultRoute.get("totalPassengers");

        System.out.println("  -> Rota gerada com sucesso! Rota ID: " + newRouteId);
        System.out.println("  -> Viagem criada com sucesso! Trip ID: " + newTripId);
        System.out.println("  -> Total de passageiros mapeados: " + totalPassengers);
        
        // 5. VALIDAÇÕES FINAIS (Testando a Lógica)
        System.out.println("\n[5] Validando os Resultados...");
        
        System.out.println("  -> Veículo esperado: Ônibus Grande (ID 502)");
        System.out.println("  -> Veículo selecionado pelo algoritmo: ID " + selectedBusId);
        assertEquals(502L, selectedBusId, "O algoritmo deveria escolher o ônibus com capacidade suficiente (50).");

        String pollStatus = jdbc.queryForObject("SELECT status FROM polls WHERE id = ?", String.class, pollId);
        System.out.println("  -> Status da Enquete após gerar a rota: " + pollStatus);
        assertEquals("Fechada", pollStatus, "A enquete deveria ter sido fechada após gerar a rota.");

        Integer totalRouteStops = jdbc.queryForObject("SELECT COUNT(*) FROM route_stops WHERE id_route = ?", Integer.class, newRouteId);
        System.out.println("  -> Total de paradas mapeadas na rota: " + totalRouteStops + " (Esperado: 3 [101, 102, 103])");
        assertEquals(3, totalRouteStops, "Deveriam existir 3 paradas exclusivas na rota gerada.");

        Integer tripPassengers = jdbc.queryForObject("SELECT COUNT(*) FROM passenger_trips WHERE id_trip = ?", Integer.class, newTripId);
        System.out.println("  -> Total de passageiros vinculados à viagem: " + tripPassengers + " (Esperado: 2)");
        assertEquals(2, tripPassengers, "Os 2 passageiros deveriam estar vinculados à Trip.");

        System.out.println("\n==================================================");
        System.out.println("TESTE CONCLUÍDO COM SUCESSO! A LÓGICA ESTÁ PERFEITA.");
        System.out.println("==================================================");
    }
}
