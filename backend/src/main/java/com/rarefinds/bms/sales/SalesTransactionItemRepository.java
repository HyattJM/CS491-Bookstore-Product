package com.rarefinds.bms.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesTransactionItemRepository extends JpaRepository<SalesTransactionItem, Long> {
}
