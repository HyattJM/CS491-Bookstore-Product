CREATE TABLE sales_transaction (id BIGINT NOT NULL AUTO_INCREMENT, total_amount DECIMAL(38,2) NOT NULL, transaction_date DATETIME(6) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB;
CREATE TABLE sales_transaction_item (id BIGINT NOT NULL AUTO_INCREMENT, quantity INTEGER NOT NULL, unit_price DECIMAL(38,2) NOT NULL, book_id BIGINT NOT NULL, transaction_id BIGINT NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB;
ALTER TABLE sales_transaction_item ADD CONSTRAINT FK_sales_item_book FOREIGN KEY (book_id) REFERENCES book (id);
ALTER TABLE sales_transaction_item ADD CONSTRAINT FK_sales_item_tx FOREIGN KEY (transaction_id) REFERENCES sales_transaction (id);
