package com.rarefinds.bms.sales;

import lombok.Data;

import java.util.List;

@Data
public class SalesRequest {
    private List<SalesRequestItem> items;
}
