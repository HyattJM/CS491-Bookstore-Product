package com.rarefinds.bms.sales;

import lombok.Data;

@Data
public class SalesRequestItem {
    private Long bookId;
    private Integer quantity;
}
