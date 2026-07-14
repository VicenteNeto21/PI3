package com.siti.sitiapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteSubmitRequest {
    private Long pollId;
    private Long boardingStopId;
    private Long boardingScheduleId;
    private Long alightingStopId;
    private Long alightingScheduleId;
}
