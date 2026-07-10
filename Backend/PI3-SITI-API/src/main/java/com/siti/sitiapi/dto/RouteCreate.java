package com.siti.sitiapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteCreate {
    private Long startStopId;
    private Long endStopId;
}
