package com.siti.sitiapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PollCreateRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<Long> boardingStops;
    private List<Long> alightingStops;
    private List<Long> schedules;
}
