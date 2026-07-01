package com.rarefinds.bms.security;

import com.rarefinds.bms.system.SystemLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SystemLogService logService;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserDto(user.getId(), user.getUsername(), user.getRole()))
                .collect(Collectors.toList());
    }

    public UserDto createUser(UserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);
        logService.log("USER_CREATED", "Created user " + savedUser.getUsername() + " with role " + savedUser.getRole(), "SYSTEM"); // Normally we'd get principal, but for now SYSTEM is fine or we can pass it in.
        return new UserDto(savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }

    public UserDto updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            // Prevent changing the last ADMIN role to something else
            if (user.getRole().equals("ADMIN") && !request.getRole().equals("ADMIN")) {
                long adminCount = userRepository.findAll().stream()
                        .filter(u -> u.getRole().equals("ADMIN"))
                        .count();
                if (adminCount <= 1) {
                    throw new IllegalArgumentException("Cannot change role of the only administrator");
                }
            }
            user.setRole(request.getRole());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        logService.log("USER_UPDATED", "Updated user " + savedUser.getUsername(), "SYSTEM");
        return new UserDto(savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole().equals("ADMIN")) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole().equals("ADMIN"))
                    .count();
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Cannot delete the only administrator");
            }
        }

        userRepository.delete(user);
        logService.log("USER_DELETED", "Deleted user " + user.getUsername(), "SYSTEM");
    }
}
