package com.siti.sitiapi.configs;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseMigration {

    private final JdbcTemplate jdbc;

    @PostConstruct
    public void migrate() {
        jdbc.execute(
            "CREATE TABLE IF NOT EXISTS notice_reads (" +
            "    id         BIGINT AUTO_INCREMENT PRIMARY KEY," +
            "    user_id    BIGINT NOT NULL," +
            "    notice_id  BIGINT NOT NULL," +
            "    read_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "    CONSTRAINT fk_nr_user FOREIGN KEY (user_id) REFERENCES users(id)," +
            "    CONSTRAINT fk_nr_notice FOREIGN KEY (notice_id) REFERENCES notices(id)," +
            "    UNIQUE KEY uk_user_notice (user_id, notice_id)" +
            ")"
        );
    }
}
