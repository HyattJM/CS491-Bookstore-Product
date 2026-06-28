package com.rarefinds.bms.analytics;

import com.rarefinds.bms.inventory.Book;
import com.rarefinds.bms.inventory.BookRepository;
import com.rarefinds.bms.sales.SalesTransaction;
import com.rarefinds.bms.sales.SalesTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final SalesTransactionRepository salesTransactionRepository;
    private final BookRepository bookRepository;

    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();

        List<SalesTransaction> allTransactions = salesTransactionRepository.findAll();
        
        // Total Revenue
        BigDecimal totalRevenue = allTransactions.stream()
                .map(SalesTransaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("totalRevenue", totalRevenue);

        // Total Books Sold
        int totalBooksSold = allTransactions.stream()
                .flatMap(t -> t.getItems().stream())
                .mapToInt(item -> item.getQuantity())
                .sum();
        data.put("totalBooksSold", totalBooksSold);

        // Low Stock Items (quantity < 10)
        List<Book> allBooks = bookRepository.findAll();
        List<Map<String, Object>> lowStock = allBooks.stream()
                .filter(b -> b.getQuantity() < 10)
                .sorted((b1, b2) -> Integer.compare(b1.getQuantity(), b2.getQuantity()))
                .limit(10)
                .map(b -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", b.getId());
                    map.put("title", b.getTitle());
                    map.put("quantity", b.getQuantity());
                    return map;
                })
                .collect(Collectors.toList());
        data.put("lowStockItems", lowStock);

        // Recent Transactions
        List<Map<String, Object>> recentTransactions = allTransactions.stream()
                .sorted((t1, t2) -> t2.getTransactionDate().compareTo(t1.getTransactionDate()))
                .limit(5)
                .map(t -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", t.getId());
                    map.put("date", t.getTransactionDate());
                    map.put("amount", t.getTotalAmount());
                    return map;
                })
                .collect(Collectors.toList());
        data.put("recentTransactions", recentTransactions);

        return data;
    }
}
