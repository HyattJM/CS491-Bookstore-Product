package com.rarefinds.bms;

import com.rarefinds.bms.inventory.Book;
import com.rarefinds.bms.inventory.BookRepository;
import com.rarefinds.bms.security.User;
import com.rarefinds.bms.security.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.util.Optional;

// @DataJpaTest is a Spring Boot annotation that focuses only on JPA components.
// It will disable full auto-configuration and instead apply only configuration relevant to JPA tests.
// By default, it configures an in-memory embedded database, scans for @Entity classes,
// and configures Spring Data JPA repositories.
@DataJpaTest
// @AutoConfigureTestDatabase with Replace.NONE tells Spring Boot NOT to replace our application's
// configured DataSource (like our MySQL setup) with an embedded, in-memory database. 
// This allows us to test against our actual local database.
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class RepositoryIntegrationTest {

    // @Autowired tells Spring's dependency injection container to automatically inject
    // an instance of the required dependency (in this case, our repositories) into this field.
    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testBookSaveAndRetrieve() {
        // Arrange
        Book book = new Book();
        book.setTitle("The Great Gatsby");
        book.setAuthor("F. Scott Fitzgerald");
        book.setGenre("Classic");
        book.setIsbn("978-0743273565");
        book.setPrice(new BigDecimal("15.99"));
        book.setQuantity(10);
        book.setCondition("New");

        // Act
        bookRepository.save(book);
        Optional<Book> retrievedBook = bookRepository.findByIsbn("978-0743273565");

        // Assert
        // Assertions.assertTrue() checks if the condition inside is true. If it is false, the test fails.
        Assertions.assertTrue(retrievedBook.isPresent(), "Book should be found by ISBN");
        
        // Assertions.assertEquals() checks if the expected value (first argument) matches 
        // the actual value (second argument). If they don't match, the test will fail.
        Assertions.assertEquals("The Great Gatsby", retrievedBook.get().getTitle());
        Assertions.assertEquals("F. Scott Fitzgerald", retrievedBook.get().getAuthor());
    }

    @Test
    public void testUserSaveAndRetrieve() {
        // Arrange
        User user = new User();
        user.setUsername("testadmin");
        user.setPasswordHash("hashed_password_123");
        user.setRole("ROLE_ADMIN");

        // Act
        userRepository.save(user);
        Optional<User> retrievedUser = userRepository.findByUsername("testadmin");

        // Assert
        Assertions.assertTrue(retrievedUser.isPresent(), "User should be found by username");
        Assertions.assertEquals("testadmin", retrievedUser.get().getUsername());
        Assertions.assertEquals("ROLE_ADMIN", retrievedUser.get().getRole());
    }
}
