package com.rarefinds.bms.inventory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*") // Allow frontend to call APIs
public class BookController {

    private final BookRepository bookRepository;

    @Autowired
    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public List<Book> getAllBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String filterBy) {
        
        if (query == null || query.trim().isEmpty()) {
            return bookRepository.findAll();
        }

        if (filterBy == null) {
            filterBy = "title";
        }

        return switch (filterBy.toLowerCase()) {
            case "author" -> bookRepository.findByAuthorContainingIgnoreCase(query);
            case "genre" -> bookRepository.findByGenreContainingIgnoreCase(query);
            case "price" -> {
                try {
                    if (query.endsWith("+")) {
                        java.math.BigDecimal min = new java.math.BigDecimal(query.replace("+", "").trim());
                        yield bookRepository.findByPriceGreaterThanEqual(min);
                    } else if (query.contains("-")) {
                        String[] parts = query.split("-");
                        java.math.BigDecimal min = new java.math.BigDecimal(parts[0].trim());
                        java.math.BigDecimal max = new java.math.BigDecimal(parts[1].trim());
                        yield bookRepository.findByPriceBetween(min, max);
                    }
                } catch (Exception e) {
                    // Ignore parse errors, return all or empty
                }
                yield bookRepository.findAll();
            }
            default -> bookRepository.findByTitleContainingIgnoreCase(query);
        };
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookRepository.findById(id);
        return book.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody Book book) {
        try {
            if (bookRepository.findByIsbn(book.getIsbn()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: ISBN already exists.");
            }
            Book savedBook = bookRepository.save(book);
            return new ResponseEntity<>(savedBook, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (optionalBook.isPresent()) {
            Optional<Book> existingWithIsbn = bookRepository.findByIsbn(bookDetails.getIsbn());
            if (existingWithIsbn.isPresent() && !existingWithIsbn.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: ISBN already exists.");
            }
            Book bookToUpdate = optionalBook.get();
            bookToUpdate.setTitle(bookDetails.getTitle());
            bookToUpdate.setAuthor(bookDetails.getAuthor());
            bookToUpdate.setGenre(bookDetails.getGenre());
            bookToUpdate.setIsbn(bookDetails.getIsbn());
            bookToUpdate.setPrice(bookDetails.getPrice());
            bookToUpdate.setQuantity(bookDetails.getQuantity());
            bookToUpdate.setCondition(bookDetails.getCondition());
            
            Book updatedBook = bookRepository.save(bookToUpdate);
            return ResponseEntity.ok(updatedBook);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
