package com.rarefinds.bms.system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemLogService {

    @Autowired
    private SystemLogRepository logRepository;

    public void log(String action, String description, String username) {
        SystemLog log = new SystemLog();
        log.setAction(action);
        log.setDescription(description);
        log.setUsername(username);
        logRepository.save(log);
    }

    public List<SystemLog> getRecentLogs() {
        return logRepository.findTop100ByOrderByTimestampDesc();
    }
}
