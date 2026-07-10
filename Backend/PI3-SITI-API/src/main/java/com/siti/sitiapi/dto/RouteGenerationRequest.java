package com.siti.sitiapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteGenerationRequest {
    private Long pollId;
    private Long startStopId;
    private Long endStopId;
    private Long driverId;
    private String departureTime;
}
