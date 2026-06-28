package com.rarefinds.bms.supplier;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        return ResponseEntity.ok(supplierRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Supplier> createSupplier(@RequestBody Supplier supplier) {
        return new ResponseEntity<>(supplierRepository.save(supplier), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Long id, @RequestBody Supplier updatedSupplier) {
        return supplierRepository.findById(id).map(supplier -> {
            supplier.setName(updatedSupplier.getName());
            supplier.setContactPerson(updatedSupplier.getContactPerson());
            supplier.setEmail(updatedSupplier.getEmail());
            supplier.setPhone(updatedSupplier.getPhone());
            return ResponseEntity.ok(supplierRepository.save(supplier));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        if (supplierRepository.existsById(id)) {
            supplierRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
