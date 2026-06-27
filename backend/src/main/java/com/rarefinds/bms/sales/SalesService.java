package com.rarefinds.bms.sales;

import com.rarefinds.bms.exception.InsufficientStockException;
import com.rarefinds.bms.inventory.Book;
import com.rarefinds.bms.inventory.BookRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SalesService {

    private final SalesTransactionRepository salesTransactionRepository;
    private final BookRepository bookRepository;

    @Transactional
    public SalesTransaction processSale(SalesRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Sales request cannot be empty");
        }

        SalesTransaction transaction = new SalesTransaction();
        transaction.setTransactionDate(LocalDateTime.now());
        
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SalesRequestItem itemRequest : request.getItems()) {
            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new EntityNotFoundException("Book not found with ID: " + itemRequest.getBookId()));

            int requestedQty = itemRequest.getQuantity();

            if (requestedQty <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero for book ID: " + book.getId());
            }

            if (book.getQuantity() < requestedQty) {
                throw new InsufficientStockException("Insufficient stock for book: '" + book.getTitle() + "'. Available: " + book.getQuantity() + ", Requested: " + requestedQty);
            }

            // Deduct inventory
            book.setQuantity(book.getQuantity() - requestedQty);
            bookRepository.save(book);

            // Create Transaction Item
            SalesTransactionItem transactionItem = new SalesTransactionItem();
            transactionItem.setTransaction(transaction);
            transactionItem.setBook(book);
            transactionItem.setQuantity(requestedQty);
            transactionItem.setUnitPrice(book.getPrice());

            transaction.getItems().add(transactionItem);

            // Calculate item total: price * quantity
            BigDecimal itemTotal = book.getPrice().multiply(BigDecimal.valueOf(requestedQty));
            totalAmount = totalAmount.add(itemTotal);
        }

        transaction.setTotalAmount(totalAmount);

        return salesTransactionRepository.save(transaction);
    }
}
