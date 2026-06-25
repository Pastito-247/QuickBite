package com.quickbite.payment_service.service;

import com.quickbite.payment_service.repository.PaymentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class TrackingIdGenerator {

    private final PaymentRepository paymentRepository;

    private final AtomicLong sequence = new AtomicLong(0);
    private static final String PREFIX = "QB";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    // Seed the sequence from the number of existing payments so tracking ids stay
    // unique across service restarts/redeploys (otherwise the counter resets to 0
    // and collides with the UNIQUE constraint on tracking_id).
    @PostConstruct
    void seedSequence() {
        sequence.set(paymentRepository.count());
    }

    public String generateTrackingId() {
        String date = LocalDateTime.now().format(DATE_FORMAT);
        long seq = sequence.incrementAndGet();
        return String.format("%s-%s-%05d", PREFIX, date, seq);
    }
}
