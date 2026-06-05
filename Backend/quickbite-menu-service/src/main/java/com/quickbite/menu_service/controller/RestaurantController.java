package com.quickbite.menu_service.controller;

import com.quickbite.menu_service.dto.RestaurantRequest;
import com.quickbite.menu_service.dto.RestaurantResponse;
import com.quickbite.menu_service.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    public List<RestaurantResponse> getAllRestaurants() {
        log.info("Getting all restaurants");
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/active")
    public List<RestaurantResponse> getActiveRestaurants() {
        log.info("Getting active restaurants");
        return restaurantService.getActiveRestaurants();
    }

    @GetMapping("/{id}")
    public RestaurantResponse getRestaurantById(@PathVariable Long id) {
        log.info("Getting restaurant with ID: {}", id);
        return restaurantService.getRestaurantById(id);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<RestaurantResponse> getRestaurantByOwnerId(@PathVariable Long ownerId) {
        log.info("Getting restaurant for owner ID: {}", ownerId);
        RestaurantResponse restaurant = restaurantService.getRestaurantByOwnerId(ownerId);
        if (restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(restaurant);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RestaurantResponse createRestaurant(@Valid @RequestBody RestaurantRequest request) {
        log.info("Creating new restaurant: {}", request.getName());
        return restaurantService.createRestaurant(request);
    }

    @PutMapping("/{id}")
    public RestaurantResponse updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request) {
        log.info("Updating restaurant with ID: {}", id);
        return restaurantService.updateRestaurant(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRestaurant(@PathVariable Long id) {
        log.info("Deleting restaurant with ID: {}", id);
        restaurantService.deleteRestaurant(id);
    }
}
