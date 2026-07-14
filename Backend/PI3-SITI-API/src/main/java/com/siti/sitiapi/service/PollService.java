package com.siti.sitiapi.service;

import com.siti.sitiapi.dto.PollCreateRequest;
import com.siti.sitiapi.dto.PollResponse;
import com.siti.sitiapi.repository.PollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PollService {

    private final PollRepository pollRepository;

    public Long createPoll(PollCreateRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("Data de fim não pode ser antes da data de início");
        }
        return pollRepository.createPoll(request);
    }

    public List<PollResponse> getAllPolls() {
        return pollRepository.findAll();
    }

    public List<PollResponse> getActivePolls() {
        return pollRepository.findActivePolls();
    }

    public java.util.Map<String, Object> getPollOptions(Long id) {
        return pollRepository.getPollOptions(id);
    }

    public java.util.Map<String, Object> publishPoll(Long id) {
        pollRepository.publishPoll(id);
        return java.util.Map.of("success", true, "id", id, "status", "Ativa");
    }

    public java.util.Map<String, Object> closePoll(Long id) {
        pollRepository.closePoll(id);
        return java.util.Map.of("success", true, "id", id, "status", "Pendente");
    }
}
