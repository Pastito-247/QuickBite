package com.quickbite.payment_service.service;

import com.quickbite.payment_service.dto.PaymentRequest;
import com.quickbite.payment_service.dto.PaymentResponse;
import com.quickbite.payment_service.entity.Payment;
import com.quickbite.payment_service.enums.PaymentStatus;
import com.quickbite.payment_service.enums.TransactionStatus;
import com.quickbite.payment_service.enums.TransactionType;
import com.quickbite.payment_service.exception.PaymentProcessingException;
import com.quickbite.payment_service.exception.ResourceNotFoundException;
import com.quickbite.payment_service.client.OrderClient;
import com.quickbite.payment_service.factory.PaymentGatewayFactory;
import com.quickbite.payment_service.gateway.PaymentGateway;
import com.quickbite.payment_service.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentGatewayFactory paymentGatewayFactory;

    @Mock
    private WalletService walletService;

    @Mock
    private TransactionService transactionService;

    @Mock
    private TrackingIdGenerator trackingIdGenerator;

    @Mock
    private OrderClient orderClient;

    @Mock
    private PaymentGateway paymentGateway;

    @InjectMocks
    private PaymentService paymentService;

    private Payment testPayment;
    private PaymentRequest paymentRequest;

    @BeforeEach
    void setUp() {
        testPayment = Payment.builder()
                .id(1L)
                .orderId("ORD-001")
                .amount(new BigDecimal("100.00"))
                .currency("USD")
                .status(PaymentStatus.COMPLETED)
                .paymentMethod("CREDIT_CARD")
                .transactionId("TXN-001")
                .trackingId("TRK-001")
                .build();

        paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId("ORD-001");
        paymentRequest.setAmount(new BigDecimal("100.00"));
        paymentRequest.setCurrency("USD");
        paymentRequest.setPaymentMethod("CREDIT_CARD");
    }

    @Test
    void shouldProcessPaymentSuccessfully() {
        // Given
        when(paymentRepository.findByOrderId("ORD-001")).thenReturn(Optional.empty());
        when(paymentGatewayFactory.getGateway("CREDIT_CARD")).thenReturn(paymentGateway);
        when(paymentGateway.processPayment(any(PaymentRequest.class))).thenReturn(
            PaymentResponse.builder()
                .paymentId(1L)
                .orderId("ORD-001")
                .amount(new BigDecimal("100.00"))
                .currency("USD")
                .status(PaymentStatus.COMPLETED)
                .paymentMethod("CREDIT_CARD")
                .transactionId("TXN-001")
                .trackingId("TRK-001")
                .build()
        );
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(trackingIdGenerator.generateTrackingId()).thenReturn("TRK-001");
        when(transactionService.createTransaction(anyLong(), any(TransactionType.class), any(BigDecimal.class), anyString(), any(TransactionStatus.class))).thenReturn(null);
        when(orderClient.updateOrderStatus(anyString(), any(Map.class))).thenReturn(null);

        // When
        PaymentResponse result = paymentService.processPayment(paymentRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo("ORD-001");
        assertThat(result.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        verify(paymentRepository).save(any(Payment.class));
        verify(transactionService).createTransaction(anyLong(), any(TransactionType.class), any(BigDecimal.class), anyString(), any(TransactionStatus.class));
    }

    @Test
    void shouldThrowExceptionWhenProcessingPaymentForAlreadyPaidOrder() {
        // Given
        when(paymentRepository.findByOrderId("ORD-001")).thenReturn(Optional.of(testPayment));

        // When & Then
        assertThatThrownBy(() -> paymentService.processPayment(paymentRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Ya existe un pago completado para esta orden");
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void shouldGetPaymentByIdSuccessfully() {
        // Given
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));

        // When
        PaymentResponse result = paymentService.getPaymentById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getPaymentId()).isEqualTo(1L);
        verify(paymentRepository).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenGettingNonExistentPaymentById() {
        // Given
        when(paymentRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> paymentService.getPaymentById(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Pago no encontrado con ID: 1");
    }

    @Test
    void shouldGetPaymentByOrderIdSuccessfully() {
        // Given
        when(paymentRepository.findByOrderId("ORD-001")).thenReturn(Optional.of(testPayment));

        // When
        PaymentResponse result = paymentService.getPaymentByOrderId("ORD-001");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo("ORD-001");
        verify(paymentRepository).findByOrderId("ORD-001");
    }

    @Test
    void shouldThrowExceptionWhenGettingNonExistentPaymentByOrderId() {
        // Given
        when(paymentRepository.findByOrderId("ORD-001")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> paymentService.getPaymentByOrderId("ORD-001"))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Pago no encontrado para la orden: ORD-001");
    }

    @Test
    void shouldGetPaymentsByStatusSuccessfully() {
        // Given
        when(paymentRepository.findByStatus(PaymentStatus.COMPLETED)).thenReturn(Arrays.asList(testPayment));

        // When
        var result = paymentService.getPaymentsByStatus(PaymentStatus.COMPLETED);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(paymentRepository).findByStatus(PaymentStatus.COMPLETED);
    }

    @Test
    void shouldRefundPaymentSuccessfully() {
        // Given
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));
        when(paymentGatewayFactory.getGateway("CREDIT_CARD")).thenReturn(paymentGateway);
        when(paymentGateway.refundPayment("TXN-001")).thenReturn(
            PaymentResponse.builder()
                .paymentId(1L)
                .orderId("ORD-001")
                .amount(new BigDecimal("100.00"))
                .currency("USD")
                .status(PaymentStatus.REFUNDED)
                .paymentMethod("CREDIT_CARD")
                .transactionId("TXN-001")
                .trackingId("TRK-001")
                .build()
        );
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(transactionService.createTransaction(anyLong(), any(TransactionType.class), any(BigDecimal.class), anyString(), any(TransactionStatus.class))).thenReturn(null);

        // When
        PaymentResponse result = paymentService.refundPayment(1L);

        // Then
        assertThat(result).isNotNull();
        verify(paymentRepository).save(any(Payment.class));
        verify(transactionService).createTransaction(anyLong(), eq(TransactionType.REFUND), any(BigDecimal.class), anyString(), any(TransactionStatus.class));
    }

    @Test
    void shouldThrowExceptionWhenRefundingNonCompletedPayment() {
        // Given
        testPayment.setStatus(PaymentStatus.PENDING);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));

        // When & Then
        assertThatThrownBy(() -> paymentService.refundPayment(1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Solo se pueden reembolsar pagos completados");
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void shouldThrowExceptionWhenRefundingNonExistentPayment() {
        // Given
        when(paymentRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> paymentService.refundPayment(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Pago no encontrado con ID: 1");
    }

    @Test
    void shouldProcessPaymentFallbackSuccessfully() {
        // Given
        Exception exception = new RuntimeException("Payment gateway unavailable");
        when(paymentGatewayFactory.getGateway("CREDIT_CARD")).thenReturn(paymentGateway);
        when(paymentGateway.processPayment(any(PaymentRequest.class))).thenReturn(
            PaymentResponse.builder()
                .paymentId(1L)
                .orderId("ORD-001")
                .amount(new BigDecimal("100.00"))
                .currency("USD")
                .status(PaymentStatus.COMPLETED)
                .paymentMethod("CREDIT_CARD")
                .transactionId("TXN-001")
                .trackingId("TRK-001")
                .build()
        );

        // When
        PaymentResponse result = paymentService.processPaymentFallback(paymentRequest, exception);

        // Then
        assertThat(result).isNotNull();
        verify(paymentGateway).processPayment(any(PaymentRequest.class));
    }

    @Test
    void shouldRefundPaymentFallbackSuccessfully() {
        // Given
        Exception exception = new RuntimeException("Payment gateway unavailable");

        // When & Then
        assertThatThrownBy(() -> paymentService.refundPaymentFallback(1L, exception))
            .isInstanceOf(PaymentProcessingException.class)
            .hasMessageContaining("Servicio de pasarela de pago no disponible para reembolso");
    }
}
