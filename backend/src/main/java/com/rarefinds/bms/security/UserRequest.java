package com.rarefinds.bms.security;

import lombok.Data;

@Data
public class UserRequest {
    private String username;
    private String password;
    private String role;
}
