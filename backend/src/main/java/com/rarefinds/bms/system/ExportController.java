package com.rarefinds.bms.system;

import com.rarefinds.bms.inventory.Book;
import com.rarefinds.bms.inventory.BookRepository;
import com.rarefinds.bms.sales.SalesTransaction;
import com.rarefinds.bms.sales.SalesTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private SalesTransactionRepository salesTransactionRepository;

    @Autowired
    private SystemLogService logService;

    @GetMapping("/inventory")
    public ResponseEntity<String> exportInventory() {
        List<Book> books = bookRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,Title,Author,Genre,ISBN,Price,Quantity\n");
        for (Book book : books) {
            csv.append(book.getId()).append(",")
               .append("\"").append(book.getTitle().replace("\"", "\"\"")).append("\",")
               .append("\"").append(book.getAuthor().replace("\"", "\"\"")).append("\",")
               .append("\"").append(book.getGenre().replace("\"", "\"\"")).append("\",")
               .append(book.getIsbn()).append(",")
               .append(book.getPrice()).append(",")
               .append(book.getQuantity()).append("\n");
        }
        
        logService.log("DATA_EXPORT", "Exported Inventory Database", "SYSTEM");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "inventory_export.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
    }

    @GetMapping("/sales")
    public ResponseEntity<String> exportSales() {
        List<SalesTransaction> sales = salesTransactionRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,Date,TotalAmount\n");
        for (SalesTransaction sale : sales) {
            csv.append(sale.getId()).append(",")
               .append(sale.getTransactionDate()).append(",")
               .append(sale.getTotalAmount()).append("\n");
        }

        logService.log("DATA_EXPORT", "Exported Sales Database", "SYSTEM");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "sales_export.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
    }
}
