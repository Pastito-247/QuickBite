package com.quickbite.menu_service.service;

import com.quickbite.menu_service.dto.RestaurantRequest;
import com.quickbite.menu_service.dto.RestaurantResponse;
import com.quickbite.menu_service.entity.Restaurant;
import com.quickbite.menu_service.exception.ResourceNotFoundException;
import com.quickbite.menu_service.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RestaurantResponse> getActiveRestaurants() {
        return restaurantRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurante no encontrado con ID: " + id));
        return mapToResponse(restaurant);
    }

    public RestaurantResponse getRestaurantByOwnerId(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request) {
        log.info("Creating new restaurant: {}", request.getName());
        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .ownerId(request.getOwnerId())
                .active(true)
                .imageUrl(request.getImageUrl())
                .build();

        Restaurant saved = restaurantRepository.save(restaurant);
        log.info("Restaurant created with ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Transactional
    public RestaurantResponse updateRestaurant(Long id, RestaurantRequest request) {
        log.info("Updating restaurant with ID: {}", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurante no encontrado con ID: " + id));

        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        if (request.getOwnerId() != null) {
            restaurant.setOwnerId(request.getOwnerId());
        }
        if (request.getActive() != null) {
            restaurant.setActive(request.getActive());
        }
        if (request.getImageUrl() != null) {
            restaurant.setImageUrl(request.getImageUrl());
        }

        Restaurant saved = restaurantRepository.save(restaurant);
        log.info("Restaurant updated: {}", id);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        log.info("Deleting restaurant with ID: {}", id);
        if (!restaurantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Restaurante no encontrado con ID: " + id);
        }
        restaurantRepository.deleteById(id);
        log.info("Restaurant deleted: {}", id);
    }

    private RestaurantResponse mapToResponse(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .ownerId(restaurant.getOwnerId())
                .active(restaurant.getActive())
                .imageUrl(restaurant.getImageUrl())
                .createdAt(restaurant.getCreatedAt())
                .updatedAt(restaurant.getUpdatedAt())
                .build();
    }
}
