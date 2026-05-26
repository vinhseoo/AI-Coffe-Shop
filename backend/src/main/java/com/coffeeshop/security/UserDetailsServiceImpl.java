package com.coffeeshop.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Spring Security UserDetailsService implementation.
 *
 * Stub: Wire với UserRepository khi hoàn thành Module Auth (Phase 1).
 * Xem PLAN.md → Phase 1.1 để biết cách implement đầy đủ.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    // TODO Phase 1: Uncomment và inject UserRepository sau khi tạo User entity
    // private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // TODO Phase 1: Thay thế bằng logic thực:
        //
        // User user = userRepository.findByUsername(username)
        //     .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + username));
        //
        // return org.springframework.security.core.userdetails.User
        //     .withUsername(user.getUsername())
        //     .password(user.getPasswordHash())
        //     .roles(user.getRole().name())
        //     .accountExpired(!user.isActive())
        //     .credentialsExpired(false)
        //     .disabled(!user.isActive())
        //     .build();

        throw new UsernameNotFoundException("UserRepository chưa được wire — hoàn thành Phase 1 trước: " + username);
    }
}
