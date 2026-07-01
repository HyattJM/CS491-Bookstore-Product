package com.rarefinds.bms.sales;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;
    private final SalesTransactionRepository salesTransactionRepository;
    private final com.rarefinds.bms.security.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<SalesTransaction> createSale(java.security.Principal principal, @RequestBody SalesRequest request) {
        com.rarefinds.bms.security.User user = null;
        if (principal != null) {
            user = userRepository.findByUsername(principal.getName()).orElse(null);
        }
        SalesTransaction transaction = salesService.processSale(request, user);
        return new ResponseEntity<>(transaction, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SalesTransaction>> getAllSales() {
        List<SalesTransaction> transactions = salesTransactionRepository.findAll();
        return ResponseEntity.ok(transactions);
    }
}
