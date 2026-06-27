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

    @PostMapping
    public ResponseEntity<SalesTransaction> createSale(@RequestBody SalesRequest request) {
        SalesTransaction transaction = salesService.processSale(request);
        return new ResponseEntity<>(transaction, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SalesTransaction>> getAllSales() {
        List<SalesTransaction> transactions = salesTransactionRepository.findAll();
        return ResponseEntity.ok(transactions);
    }
}
