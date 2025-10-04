package com.healthtracker.htbackend.dto;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PaginatedResponseTest {

    @Test
    void testDefaultConstructor() {
        PaginatedResponse<String> response = new PaginatedResponse<>();
        
        assertNull(response.getContent());
        assertNull(response.getPage());
    }

    @Test
    void testConstructorWithParameters() {
        List<String> content = Arrays.asList("item1", "item2", "item3");
        PageInfo pageInfo = new PageInfo(0, 10, 3, 1);
        
        PaginatedResponse<String> response = new PaginatedResponse<>(content, pageInfo);
        
        assertEquals(content, response.getContent());
        assertEquals(pageInfo, response.getPage());
    }

    @Test
    void testGettersAndSetters() {
        PaginatedResponse<Integer> response = new PaginatedResponse<>();
        
        List<Integer> content = Arrays.asList(1, 2, 3, 4, 5);
        PageInfo pageInfo = new PageInfo(1, 5, 15, 3);
        
        response.setContent(content);
        response.setPage(pageInfo);
        
        assertEquals(content, response.getContent());
        assertEquals(pageInfo, response.getPage());
    }

    @Test
    void testEmptyContent() {
        List<String> emptyContent = Collections.emptyList();
        PageInfo pageInfo = new PageInfo(0, 10, 0, 0);
        
        PaginatedResponse<String> response = new PaginatedResponse<>(emptyContent, pageInfo);
        
        assertTrue(response.getContent().isEmpty());
        assertEquals(0, response.getPage().getTotalElements());
        assertEquals(0, response.getPage().getTotalPages());
    }

    @Test
    void testWithWaterIntakeResponseDto() {
        WaterIntakeResponseDto dto1 = new WaterIntakeResponseDto();
        dto1.setId(1L);
        dto1.setAmountLtr(2.5f);
        
        WaterIntakeResponseDto dto2 = new WaterIntakeResponseDto();
        dto2.setId(2L);
        dto2.setAmountLtr(1.8f);
        
        List<WaterIntakeResponseDto> content = Arrays.asList(dto1, dto2);
        PageInfo pageInfo = new PageInfo(0, 10, 2, 1);
        
        PaginatedResponse<WaterIntakeResponseDto> response = new PaginatedResponse<>(content, pageInfo);
        
        assertEquals(2, response.getContent().size());
        assertEquals(1L, response.getContent().get(0).getId());
        assertEquals(2L, response.getContent().get(1).getId());
        assertEquals(2, response.getPage().getTotalElements());
    }

    @Test
    void testWithFoodIntakeResponseDto() {
        FoodIntakeResponseDto dto1 = new FoodIntakeResponseDto();
        dto1.setId(1L);
        dto1.setFoodItem("Apple");
        dto1.setCalories(95);
        
        List<FoodIntakeResponseDto> content = Arrays.asList(dto1);
        PageInfo pageInfo = new PageInfo(0, 10, 1, 1);
        
        PaginatedResponse<FoodIntakeResponseDto> response = new PaginatedResponse<>(content, pageInfo);
        
        assertEquals(1, response.getContent().size());
        assertEquals("Apple", response.getContent().get(0).getFoodItem());
        assertEquals(95, response.getContent().get(0).getCalories());
    }

    @Test
    void testSettersWithNullValues() {
        PaginatedResponse<String> response = new PaginatedResponse<>(
            Arrays.asList("test"), 
            new PageInfo(0, 10, 1, 1)
        );
        
        response.setContent(null);
        response.setPage(null);
        
        assertNull(response.getContent());
        assertNull(response.getPage());
    }
}