package com.rarefinds.bms.system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
public class StoreSettingController {

    @Autowired
    private StoreSettingRepository storeSettingRepository;

    @Autowired
    private SystemLogService logService;

    @GetMapping
    public ResponseEntity<List<StoreSetting>> getAllSettings() {
        return ResponseEntity.ok(storeSettingRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<StoreSetting> saveSetting(@RequestBody StoreSetting setting) {
        StoreSetting saved = storeSettingRepository.save(setting);
        logService.log("SETTING_UPDATED", "Updated global store setting: " + setting.getSettingKey(), "SYSTEM");
        return ResponseEntity.ok(saved);
    }
}
