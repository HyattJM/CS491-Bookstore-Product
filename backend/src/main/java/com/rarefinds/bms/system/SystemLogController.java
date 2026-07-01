package com.rarefinds.bms.system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class SystemLogController {

    @Autowired
    private SystemLogService systemLogService;

    @GetMapping
    public ResponseEntity<List<SystemLog>> getLogs() {
        return ResponseEntity.ok(systemLogService.getRecentLogs());
    }
}
