USE rare_finds_db;
UPDATE sales_transaction SET transaction_date = '2026-06-27 17:49:49' WHERE id = 1;
UPDATE sales_transaction SET transaction_date = '2026-06-26 17:49:49' WHERE id = 2;
UPDATE sales_transaction SET transaction_date = '2026-06-25 17:49:49' WHERE id = 3;
UPDATE sales_transaction SET transaction_date = '2026-06-24 17:49:49' WHERE id = 4;
UPDATE sales_transaction SET transaction_date = '2026-06-23 17:49:49' WHERE id = 5;
UPDATE book SET quantity = 2 WHERE id IN (10, 11, 12, 13);
UPDATE book SET quantity = 0 WHERE id = 14;
