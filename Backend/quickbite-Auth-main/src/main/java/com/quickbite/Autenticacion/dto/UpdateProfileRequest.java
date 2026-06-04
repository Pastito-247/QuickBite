package com.quickbite.Autenticacion.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{2,50}$", message = "El nombre debe tener entre 2 y 50 caracteres")
    private String firstName;

    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{2,50}$", message = "El apellido debe tener entre 2 y 50 caracteres")
    private String lastName;

    @Email(message = "Email inválido")
    private String email;

    @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "Teléfono inválido")
    private String phoneNumber;
}
